import { useCallback, useEffect, useState } from "react";
import { onValue, ref, remove, serverTimestamp, set, update } from "firebase/database";
import { getDb } from "../lib/firebase";
import { generatePin, roomPath, teamPath, timerPath } from "../lib/roomPaths";
import { getRoundMeta } from "../lib/rounds";

const ROUND_ORDER = [1, 2, 3];

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

  useEffect(() => {
    if (!pin) {
      setLoading(false);
      return undefined;
    }

    let db;
    try {
      db = getDb();
    } catch (err) {
      setError(err);
      setLoading(false);
      return undefined;
    }

    const roomRef = ref(db, roomPath(pin));
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        setRoom(snapshot.val());
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, timer?.running, timer?.endsAt, timer?.remainingMs, timer?.durationSeconds]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [pin, timer?.running, timer?.endsAt, timer?.remainingMs],
  );

  const resetTimer = useCallback(async () => {
    const db = getDb();
    await update(ref(db, timerPath(pin)), freshTimer(room?.meta?.currentRound || 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, room?.meta?.currentRound]);

  const removeTeam = useCallback(
    async (teamId) => {
      const db = getDb();
      await remove(ref(db, teamPath(pin, teamId)));
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
  const pin = generatePin();
  await set(ref(db, roomPath(pin)), {
    meta: {
      createdAt: serverTimestamp(),
      currentRound: 1,
      status: "open",
      timer: freshTimer(1),
    },
  });
  return pin;
}

export function getNextRound(currentRound) {
  const index = ROUND_ORDER.indexOf(currentRound);
  if (index === -1 || index === ROUND_ORDER.length - 1) return null;
  return ROUND_ORDER[index + 1];
}

export { ROUND_ORDER };
