// 데이터 출처 (2026-08-11 확인)
// - 인구: 행정안전부 주민등록인구통계(jumin.mois.go.kr), 2022년 5월 기준(2022.6.1 지방선거 직전)
// - 득표: 중앙선거관리위원회 자료공간, 제8회 전국동시지방선거 읍면동별 개표결과,
//   세종특별자치시장 선거(2022.6.1) — 더불어민주당 이춘희 / 국민의힘 최민호, 읍면동 소계 원자료
// - 경계: github.com/vuski/admdongkor 행정동 경계 ver20260701을 기반으로,
//   2022년 당시 아직 분리되지 않았던 나성동→새롬동, 어진동→도담동을 turf.js union으로 병합
//   (집현동은 ver20260701 시점에 아직 반곡동에서 분리되지 않아 별도 처리 불필요)
// 세종시 24개 읍·면·동 중 2022년 선거 당시 존재했던 22개 단위를 그대로 사용한다.

export const PARTIES = [
  { id: "DEM", name: "더불어민주당", shortName: "민주", candidate: "이춘희", color: "#1B6BFF", soft: "#E6EEFF" },
  { id: "PPP", name: "국민의힘", shortName: "국힘", candidate: "최민호", color: "#E34848", soft: "#FEECEC" },
];

export const PARTY_IDS = PARTIES.map((party) => party.id);

export const ELECTION_INFO = {
  name: "2022년 제8회 전국동시지방선거 세종특별자치시장 선거",
  date: "2022-06-01",
  sourceLabel: "중앙선거관리위원회 선거통계자료(읍면동별 개표결과)",
};

export const POPULATION_BASIS = {
  label: "2022년 5월 기준 주민등록인구",
  sourceLabel: "행정안전부 주민등록인구통계",
};

// id: 영문 슬러그(내부 키), name: 실제 행정구역명
// population: 2022년 5월 주민등록인구, votes: 2022 지방선거 세종시장 읍면동 득표수(원자료)
export const SEJONG_AREAS_RAW = [
  { id: "jochiwon", name: "조치원읍", population: 43007, votes: { DEM: 5284, PPP: 8947 } },
  { id: "yeongi", name: "연기면", population: 2733, votes: { DEM: 360, PPP: 863 } },
  { id: "yeondong", name: "연동면", population: 3092, votes: { DEM: 366, PPP: 959 } },
  { id: "bugang", name: "부강면", population: 6044, votes: { DEM: 840, PPP: 1497 } },
  { id: "geumnam", name: "금남면", population: 8772, votes: { DEM: 1196, PPP: 2491 } },
  { id: "janggun", name: "장군면", population: 7011, votes: { DEM: 718, PPP: 1445 } },
  { id: "yeonseo", name: "연서면", population: 7306, votes: { DEM: 781, PPP: 1862 } },
  { id: "jeonui", name: "전의면", population: 5532, votes: { DEM: 768, PPP: 1597 } },
  { id: "jeondong", name: "전동면", population: 3338, votes: { DEM: 312, PPP: 997 } },
  { id: "sojeong", name: "소정면", population: 2222, votes: { DEM: 285, PPP: 676 } },
  { id: "hansol", name: "한솔동", population: 18387, votes: { DEM: 3426, PPP: 3157 } },
  { id: "saerom", name: "새롬동", population: 39239, votes: { DEM: 5863, PPP: 5874 } },
  { id: "dodam", name: "도담동", population: 34235, votes: { DEM: 5361, PPP: 5670 } },
  { id: "haemil", name: "해밀동", population: 8648, votes: { DEM: 1667, PPP: 1186 } },
  { id: "areum", name: "아름동", population: 23270, votes: { DEM: 4419, PPP: 3534 } },
  { id: "jongchon", name: "종촌동", population: 28846, votes: { DEM: 4831, PPP: 4681 } },
  { id: "goun", name: "고운동", population: 34461, votes: { DEM: 4879, PPP: 5121 } },
  { id: "sodam", name: "소담동", population: 21485, votes: { DEM: 3606, PPP: 3458 } },
  { id: "bangok", name: "반곡동", population: 23382, votes: { DEM: 3790, PPP: 3185 } },
  { id: "boram", name: "보람동", population: 18869, votes: { DEM: 3083, PPP: 3142 } },
  { id: "daepyeong", name: "대평동", population: 11285, votes: { DEM: 1941, PPP: 1954 } },
  { id: "dajeong", name: "다정동", population: 28176, votes: { DEM: 4216, PPP: 4310 } },
];

// 실제 GeoJSON 경계(turf.js booleanIntersects, 10m 버퍼)로부터 계산한 인접관계.
// scripts/build-neighbors.mjs 로 재생성 가능.
export const AREA_NEIGHBORS = {
  jochiwon: ["yeonseo", "jeondong", "yeondong"],
  bugang: ["geumnam", "yeondong"],
  janggun: ["yeonseo", "hansol", "goun", "dajeong", "geumnam", "yeongi", "saerom"],
  yeonseo: ["jochiwon", "janggun", "jeonui", "jeondong", "yeongi", "yeondong"],
  jeonui: ["yeonseo", "jeondong", "sojeong"],
  jeondong: ["jochiwon", "yeonseo", "jeonui"],
  sojeong: ["jeonui"],
  hansol: ["janggun", "saerom"],
  areum: ["jongchon", "goun", "haemil", "dodam"],
  jongchon: ["areum", "goun", "dajeong", "dodam"],
  boram: ["daepyeong", "geumnam", "sodam", "saerom"],
  goun: ["janggun", "areum", "jongchon", "dajeong", "yeongi", "haemil"],
  dajeong: ["janggun", "jongchon", "goun", "saerom", "dodam"],
  daepyeong: ["boram", "geumnam", "saerom"],
  geumnam: ["bugang", "janggun", "boram", "daepyeong", "sodam", "yeondong", "bangok", "saerom"],
  sodam: ["boram", "geumnam", "bangok", "saerom"],
  yeongi: ["janggun", "yeonseo", "goun", "haemil", "yeondong", "bangok"],
  haemil: ["areum", "goun", "yeongi", "bangok", "saerom", "dodam"],
  yeondong: ["jochiwon", "bugang", "yeonseo", "geumnam", "yeongi", "bangok"],
  bangok: ["geumnam", "sodam", "yeongi", "haemil", "yeondong", "saerom"],
  saerom: ["janggun", "hansol", "boram", "dajeong", "daepyeong", "geumnam", "sodam", "haemil", "bangok", "dodam"],
  dodam: ["areum", "jongchon", "dajeong", "haemil", "saerom"],
};

export const SEJONG_AREAS = SEJONG_AREAS_RAW.map((area) => ({
  ...area,
  neighbors: AREA_NEIGHBORS[area.id] || [],
}));

export const AREA_BY_ID = Object.fromEntries(SEJONG_AREAS.map((area) => [area.id, area]));

export const AREA_IDS = SEJONG_AREAS.map((area) => area.id);

export function getTotalPopulation() {
  return SEJONG_AREAS.reduce((sum, area) => sum + area.population, 0);
}

export function getTotalVotes() {
  return SEJONG_AREAS.reduce(
    (sum, area) => {
      sum.DEM += area.votes.DEM;
      sum.PPP += area.votes.PPP;
      return sum;
    },
    { DEM: 0, PPP: 0 },
  );
}
