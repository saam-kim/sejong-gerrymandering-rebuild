export const ROUNDS = {
  1: {
    round: 1,
    name: "1라운드 · 기본 획정",
    summary: "인접 조건과 인구 60,000~110,000명 조건을 만족하는 5개 선거구를 만드세요.",
    durationSeconds: 600, // 10분 — 처음이라 가장 오래 걸림. 필요하면 교사가 조정 가능
  },
  2: {
    round: 2,
    name: "2라운드 · 의석 뒤집기",
    summary: "같은 조건 안에서 한 정당이 5석 중 4석을 갖도록 의도적으로 설계하세요.",
    durationSeconds: 480, // 8분
  },
  3: {
    round: 3,
    name: "3라운드 · 공정성 회복",
    summary: "득표율과 의석 비율의 차이가 최소가 되도록 지도를 다시 설계하세요.",
    durationSeconds: 480, // 8분
  },
};

export function getRoundMeta(round) {
  return ROUNDS[round] || ROUNDS[1];
}
