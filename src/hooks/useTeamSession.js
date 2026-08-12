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

// 참가 폼(StudentJoin)에서 "이미 이 PIN으로 들어온 적 있는 기기인지"를 제출 시점에 바로
// 확인하기 위한 헬퍼. useTeamSession의 내부 state는 훅이 처음 마운트될 때의 pin 값으로
// 딱 한 번만 초기화되므로(입력 중인 pin이 바뀌어도 재평가되지 않음), 그 state에 의존하지
// 않고 localStorage를 직접 읽는다.
export function readTeamSession(pin) {
  return readSession(pin);
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
