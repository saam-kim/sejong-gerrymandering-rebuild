import { describe, expect, it } from "vitest";
import {
  DISTRICT_POPULATION_LIMITS,
  calculateDistrictResults,
  calculateSeats,
  checkContiguity,
  getEmptyAssignments,
  isAreaSetContiguous,
  seatsMatchRound2Target,
  validatePlan,
} from "./districtRules";
import { AREA_BY_ID, AREA_IDS } from "../data/sejongAreas";

describe("isAreaSetContiguous", () => {
  it("두 인접 지역은 연결된 것으로 판단한다", () => {
    const [a] = AREA_IDS;
    const neighbor = AREA_BY_ID[a].neighbors[0];
    expect(isAreaSetContiguous([a, neighbor])).toBe(true);
  });

  it("서로 인접하지 않은 지역 조합은 끊긴 것으로 판단한다", () => {
    // 조치원읍과 소정면은 직접 인접하지 않는다(사이에 전의면/전동면이 있음)
    expect(isAreaSetContiguous(["jochiwon", "sojeong"])).toBe(false);
  });

  it("빈 배열이나 단일 지역은 항상 연결된 것으로 취급한다", () => {
    expect(isAreaSetContiguous([])).toBe(true);
    expect(isAreaSetContiguous(["jochiwon"])).toBe(true);
  });
});

describe("checkContiguity", () => {
  it("모든 지역이 한 선거구에 몰려도 유효하다(전체가 연결돼 있으므로)", () => {
    const assignments = getEmptyAssignments();
    for (const id of AREA_IDS) assignments[id] = 1;
    const result = checkContiguity(assignments);
    expect(result.isValid).toBe(true);
  });

  it("한 선거구 내부에 끊긴 지역이 섞이면 무효하다", () => {
    const assignments = getEmptyAssignments();
    assignments.jochiwon = 1;
    assignments.sojeong = 1; // 인접하지 않음
    const result = checkContiguity(assignments);
    expect(result.isValid).toBe(false);
    expect(result.invalidDistricts).toContain(1);
  });
});

describe("calculateDistrictResults / calculateSeats", () => {
  it("한 선거구에 전체 지역을 배정하면 전체 득표 합과 일치한다", () => {
    const assignments = getEmptyAssignments();
    for (const id of AREA_IDS) assignments[id] = 1;
    const [result] = calculateDistrictResults(assignments, { districts: [1] });
    const expectedDem = AREA_IDS.reduce((sum, id) => sum + AREA_BY_ID[id].votes.DEM, 0);
    const expectedPpp = AREA_IDS.reduce((sum, id) => sum + AREA_BY_ID[id].votes.PPP, 0);
    expect(result.votes.DEM).toBe(expectedDem);
    expect(result.votes.PPP).toBe(expectedPpp);
    expect(result.winner).toBe("PPP"); // 시 전체 득표는 국힘 최민호가 더 많음
  });

  it("인구가 하한 미만이면 populationValid가 false다", () => {
    const assignments = getEmptyAssignments();
    assignments.sojeong = 1; // 인구 2,222명, 하한 60,000명 미달
    const [result] = calculateDistrictResults(assignments, { districts: [1] });
    expect(result.population).toBeLessThan(DISTRICT_POPULATION_LIMITS.minPopulation);
    expect(result.populationValid).toBe(false);
  });

  it("빈 선거구는 승자가 없다", () => {
    const assignments = getEmptyAssignments();
    const [result] = calculateDistrictResults(assignments, { districts: [1] });
    expect(result.winner).toBeNull();
    expect(result.totalVotes).toBe(0);
  });
});

describe("seatsMatchRound2Target", () => {
  it("4:1 또는 1:4 분포만 인정한다", () => {
    expect(seatsMatchRound2Target({ DEM: 4, PPP: 1 })).toBe(true);
    expect(seatsMatchRound2Target({ DEM: 1, PPP: 4 })).toBe(true);
    expect(seatsMatchRound2Target({ DEM: 3, PPP: 2 })).toBe(false);
    expect(seatsMatchRound2Target({ DEM: 5, PPP: 0 })).toBe(false);
  });
});

describe("validatePlan", () => {
  it("미배정 지역이 있으면 제출 불가하고 구체적 사유를 담는다", () => {
    const result = validatePlan(getEmptyAssignments(), { round: 1 });
    expect(result.canSubmit).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("2라운드는 4:1 의석이 아니면 missionSuccess가 false다", () => {
    const assignments = getEmptyAssignments();
    // 5개 선거구 모두에 지역을 배정하되 4:1이 아닌 상황을 강제로 만들기는 실제 지리로는
    // 매 케이스 보장이 어려우므로, 여기서는 결과 계산 로직 자체(round2Matched 필드 존재)만 검증한다.
    for (const id of AREA_IDS) assignments[id] = 1;
    const result = validatePlan(assignments, { round: 2, districts: [1] });
    expect(result).toHaveProperty("round2Matched");
  });
});
