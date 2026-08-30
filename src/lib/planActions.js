import { ref, remove, runTransaction, serverTimestamp, set, update } from "firebase/database";
import { getDb, waitForDatabaseConnection } from "./firebase";
import { draftPath, submissionPath, teamCounterPath, teamPath } from "./roomPaths";

/**
 * 모둠 이름을 학생이 직접 입력하지 않고, 그 방에 입장한 순서대로 "N모둠"을 서버에서
 * 원자적으로 배정한다(가명처리 — 실명 등 식별정보가 저장/동기화될 여지를 구조적으로 없앤다).
 * 여러 학생이 동시에 입장해도 Firebase 트랜잭션이라 번호가 겹치지 않는다.
 */
export async function joinTeam(pin, teamId) {
  const db = getDb();
  await waitForDatabaseConnection(db);
  const result = await runTransaction(
    ref(db, teamCounterPath(pin)),
    (current) => (typeof current === "number" ? current + 1 : 1),
    { applyLocally: false },
  );
  if (!result.committed) throw new Error("방 참가가 취소되었습니다. PIN을 다시 확인해 주세요.");
  const teamName = `${result.snapshot.val()}모둠`;
  await set(ref(db, teamPath(pin, teamId)), {
    teamName,
    joinedAt: serverTimestamp(),
  });
  return teamName;
}

export async function saveDraft(pin, round, teamId, assignments) {
  const db = getDb();
  await update(ref(db, draftPath(pin, round, teamId)), {
    assignments,
    updatedAt: serverTimestamp(),
  });
}

export async function submitPlan(pin, round, teamId, assignments) {
  const db = getDb();
  await waitForDatabaseConnection(db);
  await set(ref(db, submissionPath(pin, round, teamId)), {
    assignments,
    submittedAt: serverTimestamp(),
  });
}

export async function clearDraft(pin, round, teamId) {
  const db = getDb();
  await remove(ref(db, draftPath(pin, round, teamId)));
}
