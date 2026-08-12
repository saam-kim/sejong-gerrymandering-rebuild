import { useCallback, useState } from "react";
import { joinTeam } from "../lib/planActions";
import { makeTeamId } from "../lib/roomPaths";

function storageKey(pin) {
  return `gerrymandering_team_${pin}`;
}

function readSession(pin) {
  try {
    const raw = window.localStorage.getItem(storageKey(pin));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(pin, session) {
  window.localStorage.setItem(storageKey(pin), JSON.stringify(session));
}

/**
 * 학생 모둠 세션. 새로고침해도 같은 모둠으로 자동 복귀하도록 localStorage에 teamId를 보관한다.
 */
export function useTeamSession(pin) {
  const [session, setSession] = useState(() => (pin ? readSession(pin) : null));

  const join = useCallback(
    async (teamName) => {
      const teamId = makeTeamId(teamName);
      await joinTeam(pin, teamId, teamName);
      const next = { teamId, teamName };
      writeSession(pin, next);
      setSession(next);
      return next;
    },
    [pin],
  );

  const leave = useCallback(() => {
    window.localStorage.removeItem(storageKey(pin));
    setSession(null);
  }, [pin]);

  return { teamId: session?.teamId || null, teamName: session?.teamName || null, join, leave };
}
