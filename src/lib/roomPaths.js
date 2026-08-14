function cleanPin(pin) {
  return String(pin || "").trim();
}

export const roomPath = (pin) => `rooms/${cleanPin(pin)}`;
export const roomMetaPath = (pin) => `rooms/${cleanPin(pin)}/meta`;
export const timerPath = (pin) => `rooms/${cleanPin(pin)}/meta/timer`;
export const teamCounterPath = (pin) => `rooms/${cleanPin(pin)}/meta/teamCounter`;
export const roomTeamsPath = (pin) => `rooms/${cleanPin(pin)}/teams`;
export const teamPath = (pin, teamId) => `rooms/${cleanPin(pin)}/teams/${teamId}`;
export const draftPath = (pin, round, teamId) => `rooms/${cleanPin(pin)}/drafts/${round}/${teamId}`;
export const submissionPath = (pin, round, teamId) => `rooms/${cleanPin(pin)}/submissions/${round}/${teamId}`;
export const roundSubmissionsPath = (pin, round) => `rooms/${cleanPin(pin)}/submissions/${round}`;

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 모둠 이름을 더 이상 자유 입력받지 않으므로(가명처리 — 실명 등 식별정보가 들어갈 수
// 없도록 입장 순서 기반 번호를 서버에서 자동 배정한다), teamId도 이름과 무관하게 생성한다.
export function makeTeamId() {
  const suffix = Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7);
  return `team-${suffix}`;
}
