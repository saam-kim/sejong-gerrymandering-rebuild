import { AREA_BY_ID, PARTY_IDS, SEJONG_AREAS, getTotalPopulation, getTotalVotes } from "../data/sejongAreas";

export const DISTRICTS = [1, 2, 3, 4, 5];
export const DISTRICT_POPULATION_LIMITS = { minPopulation: 60_000, maxPopulation: 110_000 };
export const PACKING_THRESHOLD = 0.75;

export const DISTRICT_THEME = {
  // 정당색(민주 #1B6BFF / 국힘 #E34848)과 겹치지 않는 5색 팔레트
  // 실제 선거구 명명 관행(갑/을/병/정/무)을 따라 현실감을 살린다.
  1: { name: "세종갑", color: "#7C4DFF", soft: "#F0EBFF" }, // 보라
  2: { name: "세종을", color: "#E67E22", soft: "#FDF0E4" }, // 주황
  3: { name: "세종병", color: "#0E9594", soft: "#E4F5F5" }, // 틸
  4: { name: "세종정", color: "#B08900", soft: "#FBF3D9" }, // 머스타드
  5: { name: "세종무", color: "#5C6B7A", soft: "#EBEEF0" }, // 슬레이트
};

export function getEmptyAssignments() {
  return Object.fromEntries(SEJONG_AREAS.map((area) => [area.id, null]));
}

export function normalizeAssignments(assignments) {
  const empty = getEmptyAssignments();
  if (!assignments || Array.isArray(assignments)) return empty;

  return Object.fromEntries(
    SEJONG_AREAS.map((area) => {
      const value = assignments[area.id];
      return [area.id, value === undefined || value === null ? null : Number(value)];
    }),
  );
}

export function getDistrictGroups(assignments, districts = DISTRICTS) {
  const normalized = normalizeAssignments(assignments);
  return Object.fromEntries(
    districts.map((districtId) => [
      districtId,
      SEJONG_AREAS.filter((area) => normalized[area.id] === districtId).map((area) => area.id),
    ]),
  );
}

export function isAreaSetContiguous(areaIds) {
  if (!areaIds || areaIds.length <= 1) return true;

  const areaSet = new Set(areaIds);
  const visited = new Set([areaIds[0]]);
  const queue = [areaIds[0]];

  while (queue.length > 0) {
    const currentId = queue.shift();
    for (const neighborId of AREA_BY_ID[currentId]?.neighbors || []) {
      if (areaSet.has(neighborId) && !visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  return visited.size === areaIds.length;
}

export function checkContiguity(assignments, { districts = DISTRICTS } = {}) {
  const groups = getDistrictGroups(assignments, districts);
  const invalidDistricts = [];
  const errors = [];

  for (const districtId of districts) {
    const areaIds = groups[districtId];
    if (areaIds.length > 0 && !isAreaSetContiguous(areaIds)) {
      invalidDistricts.push(districtId);
      errors.push(`${DISTRICT_THEME[districtId].name}의 지역이 서로 인접하지 않습니다.`);
    }
  }

  return { isValid: invalidDistricts.length === 0, invalidDistricts, errors };
}

function sumVotes(areaIds) {
  return areaIds.reduce(
    (sum, areaId) => {
      const votes = AREA_BY_ID[areaId]?.votes || { DEM: 0, PPP: 0 };
      sum.DEM += votes.DEM;
      sum.PPP += votes.PPP;
      return sum;
    },
    { DEM: 0, PPP: 0 },
  );
}

function pickWinner(votes) {
  if (votes.DEM === votes.PPP) return null;
  return votes.DEM > votes.PPP ? "DEM" : "PPP";
}

export function getPopulationRange(districtCount = DISTRICTS.length) {
  const averagePopulation = getTotalPopulation() / districtCount;
  return { averagePopulation, ...DISTRICT_POPULATION_LIMITS };
}

export function calculateDistrictResults(assignments, { districts = DISTRICTS } = {}) {
  const groups = getDistrictGroups(assignments, districts);
  const { averagePopulation, minPopulation, maxPopulation } = getPopulationRange(districts.length);

  return districts.map((districtId) => {
    const areaIds = groups[districtId];
    const population = areaIds.reduce((sum, areaId) => sum + AREA_BY_ID[areaId].population, 0);
    const votes = sumVotes(areaIds);
    const totalVotes = votes.DEM + votes.PPP;
    const winner = totalVotes > 0 ? pickWinner(votes) : null;
    const winnerVoteShare = winner ? votes[winner] / totalVotes : 0;

    return {
      districtId,
      areaIds,
      areaNames: areaIds.map((areaId) => AREA_BY_ID[areaId].name),
      population,
      populationDeviation: averagePopulation ? (population - averagePopulation) / averagePopulation : 0,
      populationValid: population >= minPopulation && population <= maxPopulation,
      votes,
      totalVotes,
      winner,
      winnerVoteShare,
      isPacking: winnerVoteShare >= PACKING_THRESHOLD,
      contiguous: areaIds.length === 0 || isAreaSetContiguous(areaIds),
    };
  });
}

export function calculateSeats(assignments, options = {}) {
  return calculateDistrictResults(assignments, options).reduce(
    (seats, result) => {
      if (result.winner) seats[result.winner] += 1;
      return seats;
    },
    { DEM: 0, PPP: 0 },
  );
}

export function getExpectedSeats(districtCount = DISTRICTS.length) {
  const totalVotes = getTotalVotes();
  const allVotes = PARTY_IDS.reduce((sum, partyId) => sum + totalVotes[partyId], 0);
  return Object.fromEntries(
    PARTY_IDS.map((partyId) => [partyId, allVotes ? (totalVotes[partyId] / allVotes) * districtCount : 0]),
  );
}

export function seatsMatchRound2Target(seats = {}) {
  return (
    (Number(seats.DEM || 0) === 4 && Number(seats.PPP || 0) === 1) ||
    (Number(seats.DEM || 0) === 1 && Number(seats.PPP || 0) === 4)
  );
}

/**
 * 라운드별 제출 검증. round: 1 | 2 | 3
 * 규칙 체크리스트를 상시 노출하지 않는 UX 원칙에 따라, 이 함수는 "제출 시도" 시에만 호출되고
 * errors 배열에 구체적인 실패 사유를 담아 반환한다.
 */
export function validatePlan(assignments, { round = 1, districts = DISTRICTS } = {}) {
  const normalized = normalizeAssignments(assignments);
  const districtResults = calculateDistrictResults(normalized, { districts });
  const contiguity = checkContiguity(normalized, { districts });
  const unassignedAreaIds = SEJONG_AREAS.filter((area) => !normalized[area.id]).map((area) => area.id);
  const emptyDistricts = districtResults.filter((result) => result.areaIds.length === 0).map((result) => result.districtId);
  const populationViolations = districtResults.filter(
    (result) => result.areaIds.length > 0 && !result.populationValid,
  );
  const seats = calculateSeats(normalized, { districts });
  const expectedSeats = getExpectedSeats(districts.length);
  const distortionByParty = Object.fromEntries(
    PARTY_IDS.map((partyId) => [partyId, seats[partyId] - expectedSeats[partyId]]),
  );
  const distortionScore = Math.max(...PARTY_IDS.map((partyId) => Math.abs(distortionByParty[partyId])));

  const populationValid = populationViolations.length === 0;
  const canSubmit = unassignedAreaIds.length === 0 && emptyDistricts.length === 0 && contiguity.isValid;
  const round2Matched = seatsMatchRound2Target(seats);

  const errors = [...contiguity.errors];
  if (unassignedAreaIds.length > 0) {
    errors.push(`아직 선거구에 배정하지 않은 읍·면·동이 ${unassignedAreaIds.length}곳 있습니다.`);
  }
  if (emptyDistricts.length > 0) {
    errors.push(
      `${emptyDistricts.map((id) => DISTRICT_THEME[id].name).join(", ")}에 배정된 지역이 없습니다.`,
    );
  }
  for (const result of populationViolations) {
    const districtName = DISTRICT_THEME[result.districtId].name;
    const pop = result.population.toLocaleString();
    if (result.population < DISTRICT_POPULATION_LIMITS.minPopulation) {
      errors.push(`${districtName}의 인구가 ${pop}명으로 하한 ${DISTRICT_POPULATION_LIMITS.minPopulation.toLocaleString()}명에 못 미칩니다.`);
    } else {
      errors.push(`${districtName}의 인구가 ${pop}명으로 상한 ${DISTRICT_POPULATION_LIMITS.maxPopulation.toLocaleString()}명을 초과했습니다.`);
    }
  }
  if (round === 2 && canSubmit && populationValid && !round2Matched) {
    errors.push("5석 중 4석을 한 정당이 가져가도록 설계되지 않았습니다. 의석 결과를 확인해 다시 배정해 보세요.");
  }

  const missionSuccess =
    canSubmit &&
    populationValid &&
    (round !== 2 || round2Matched);

  return {
    canSubmit,
    missionSuccess,
    seats,
    expectedSeats,
    distortionByParty,
    distortionScore,
    districtResults,
    contiguity,
    populationValid,
    populationViolations,
    unassignedAreaIds,
    emptyDistricts,
    round2Matched,
    errors,
  };
}
