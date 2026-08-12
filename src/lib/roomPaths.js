function cleanPin(pin) {
  return String(pin || "").trim();
}

export const roomPath = (pin) => `rooms/${cleanPin(pin)}`;
export const roomMetaPath = (pin) => `rooms/${cleanPin(pin)}/meta`;
export const timerPath = (pin) => `rooms/${cleanPin(pin)}/meta/timer`;
export const roomTeamsPath = (pin) => `rooms/${cleanPin(pin)}/teams`;
export const teamPath = (pin, teamId) => `rooms/${cleanPin(pin)}/teams/${teamId}`;
export const draftPath = (pin, round, teamId) => `rooms/${cleanPin(pin)}/drafts/${round}/${teamId}`;
export const submissionPath = (pin, round, teamId) => `rooms/${cleanPin(pin)}/submissions/${round}/${teamId}`;
export const roundSubmissionsPath = (pin, round) => `rooms/${cleanPin(pin)}/submissions/${round}`;

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function makeTeamId(teamName) {
  const suffix = Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5);
  const safeName = teamName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .slice(0, 20);
  return `${safeName || "team"}-${suffix}`;
}
