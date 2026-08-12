import { useEffect, useRef, useState } from "react";
import { saveDraft } from "../lib/planActions";

const DEBOUNCE_MS = 800;

/**
 * 배정 변경을 디바운스해서 drafts/{round}/{teamId}에 저장한다.
 * isLocked(=이미 제출됨)가 true면 절대 쓰지 않는다 — 제출 직후 자동저장이 제출 데이터를
 * 덮어쓰는 경합을 막기 위한 핵심 가드.
 */
export function useAutosave({ pin, round, teamId, assignments, isLocked }) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved
  const timerRef = useRef(null);
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;

  useEffect(() => {
    if (!pin || !teamId || isLocked) return undefined;

    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (isLockedRef.current) return; // 대기 중 제출이 끼어든 경우 저장하지 않는다
      try {
        await saveDraft(pin, round, teamId, assignments);
        setStatus("saved");
      } catch {
        setStatus("idle");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, round, teamId, isLocked, JSON.stringify(assignments)]);

  return status;
}
