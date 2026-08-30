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

export function isValidPin(pin) {
  return /^\d{6}$/.test(cleanPin(pin));
}

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function claimAvailablePin(tryClaim, generate = generatePin, maxAttempts = 12) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const pin = generate();
    if (await tryClaim(pin)) return pin;
  }
  throw new Error("사용 가능한 방 PIN을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
}

export function buildTeamRemovalUpdates(teamId) {
  const updates = { [`teams/${teamId}`]: null };
  for (const round of [1, 2, 3]) {
    updates[`drafts/${round}/${teamId}`] = null;
    updates[`submissions/${round}/${teamId}`] = null;
  }
  return updates;
}

// 모둠 이름을 더 이상 자유 입력받지 않으므로(가명처리 — 실명 등 식별정보가 들어갈 수
// 없도록 입장 순서 기반 번호를 서버에서 자동 배정한다), teamId도 이름과 무관하게 생성한다.
export function makeTeamId() {
  const suffix = Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7);
  return `team-${suffix}`;
}
