import { useCallback, useEffect, useState } from "react";
import { onValue, ref, runTransaction, serverTimestamp, update } from "firebase/database";
import { getDb, waitForDatabaseConnection } from "../lib/firebase";
import { buildTeamRemovalUpdates, claimAvailablePin, roomMetaPath, roomPath, timerPath } from "../lib/roomPaths";
import { getRoundMeta } from "../lib/rounds";

const ROUND_ORDER = [1, 2, 3];
const ROOM_LOAD_TIMEOUT_MS = 12_000;

function freshTimer(round) {
  const durationSeconds = getRoundMeta(round).durationSeconds;
  return { durationSeconds, remainingMs: durationSeconds * 1000, endsAt: null, running: false };
}

/**
 * 방(pin) 하나의 전체 상태(meta/teams/drafts/submissions)를 실시간 구독한다.
 * 교사 대시보드와 학생 플레이 화면이 공통으로 사용한다.
 */
export function useRoom(pin) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    if (!pin) {
      setRoom(null);
      setLoading(false);
      return undefined;
    }

    setRoom(null);
    setLoading(true);
    setError(null);
    setConnected(null);

    let db;
    try {
      db = getDb();
    } catch (err) {
      setError(err);
      setLoading(false);
      return undefined;
    }

    let connectionState = null;
    let latestRoom = null;
    let hasRoomSnapshot = false;

    const finishLoadIfReady = () => {
      if (!hasRoomSnapshot) return;
      if (latestRoom !== null || connectionState === true) {
        clearTimeout(loadTimeout);
        setRoom(latestRoom);
        setLoading(false);
        setError(null);
      }
    };

    const loadTimeout = setTimeout(() => {
      setError(new Error("실시간 서버의 방 정보를 불러오지 못했습니다. 네트워크를 확인하고 새로고침해 주세요."));
      setLoading(false);
    }, ROOM_LOAD_TIMEOUT_MS);

    const unsubscribeConnection = onValue(
      ref(db, ".info/connected"),
      (snapshot) => {
        connectionState = snapshot.val() === true;
        setConnected(connectionState);
        finishLoadIfReady();
      },
      (err) => {
        setConnected(false);
        setError(err);
      },
    );

    const unsubscribeRoom = onValue(
      ref(db, roomPath(pin)),
      (snapshot) => {
        hasRoomSnapshot = true;
        latestRoom = snapshot.val();
        if (latestRoom !== null) setRoom(latestRoom);
        finishLoadIfReady();
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => {
      clearTimeout(loadTimeout);
      unsubscribeConnection();
      unsubscribeRoom();
    };
  }, [pin]);

  const advanceRound = useCallback(
    async (nextRound) => {
      const db = getDb();
      await update(ref(db, `${roomPath(pin)}/meta`), { currentRound: nextRound, timer: freshTimer(nextRound) });
    },
    [pin],
  );

  const timer = room?.meta?.timer || null;

  const toggleTimer = useCallback(async () => {
    if (!timer) return;
    const db = getDb();
    if (timer.running) {
      const remainingMs = Math.max(0, (timer.endsAt ?? Date.now()) - Date.now());
      await update(ref(db, timerPath(pin)), { running: false, endsAt: null, remainingMs });
    } else {
      const remainingMs = timer.remainingMs ?? timer.durationSeconds * 1000;
      await update(ref(db, timerPath(pin)), { running: true, endsAt: Date.now() + remainingMs, remainingMs: null });
    }
  }, [pin, timer]);

  const addTime = useCallback(
    async (deltaSeconds) => {
      if (!timer) return;
      const db = getDb();
      const deltaMs = deltaSeconds * 1000;
      if (timer.running) {
        const nextEndsAt = Math.max(Date.now(), (timer.endsAt ?? Date.now()) + deltaMs);
        await update(ref(db, timerPath(pin)), { endsAt: nextEndsAt });
      } else {
        const nextRemaining = Math.max(0, (timer.remainingMs ?? 0) + deltaMs);
        await update(ref(db, timerPath(pin)), { remainingMs: nextRemaining });
      }
    },
    [pin, timer],
  );

  const resetTimer = useCallback(async () => {
    const db = getDb();
    await update(ref(db, timerPath(pin)), freshTimer(room?.meta?.currentRound || 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, room?.meta?.currentRound]);

  const removeTeam = useCallback(
    async (teamId) => {
      const db = getDb();
      await update(ref(db, roomPath(pin)), buildTeamRemovalUpdates(teamId));
    },
    [pin],
  );

  return {
    room,
    meta: room?.meta || null,
    teams: room?.teams || {},
    drafts: room?.drafts || {},
    submissions: room?.submissions || {},
    timer,
    loading,
    error,
    connected,
    exists: room !== null,
    advanceRound,
    toggleTimer,
    addTime,
    resetTimer,
    removeTeam,
  };
}

export async function createRoom() {
  const db = getDb();
  await waitForDatabaseConnection(db);
  return claimAvailablePin(async (pin) => {
    const result = await runTransaction(
      ref(db, roomMetaPath(pin)),
      (current) => {
        if (current !== null) return undefined;
        return {
          createdAt: serverTimestamp(),
          currentRound: 1,
          status: "open",
          teamCounter: 0,
          timer: freshTimer(1),
        };
      },
      { applyLocally: false },
    );
    return result.committed;
  });
}

export function getNextRound(currentRound) {
  const index = ROUND_ORDER.indexOf(currentRound);
  if (index === -1 || index === ROUND_ORDER.length - 1) return null;
  return ROUND_ORDER[index + 1];
}

export { ROUND_ORDER };
