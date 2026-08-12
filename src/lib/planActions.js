import { ref, remove, serverTimestamp, set, update } from "firebase/database";
import { getDb } from "./firebase";
import { draftPath, submissionPath, teamPath } from "./roomPaths";

export async function joinTeam(pin, teamId, teamName) {
  const db = getDb();
  await set(ref(db, teamPath(pin, teamId)), {
    teamName,
    joinedAt: serverTimestamp(),
  });
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
  await set(ref(db, submissionPath(pin, round, teamId)), {
    assignments,
    submittedAt: serverTimestamp(),
  });
}

export async function clearDraft(pin, round, teamId) {
  const db = getDb();
  await remove(ref(db, draftPath(pin, round, teamId)));
}
