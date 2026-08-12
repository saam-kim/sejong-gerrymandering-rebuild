// src/data/sejongBoundaries.json의 실제 경계로부터 인접관계를 재계산해 콘솔에 출력한다.
// 결과를 src/data/sejongAreas.js의 AREA_NEIGHBORS에 수동으로 반영한다.
// 실행: node scripts/build-neighbors.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as turf from "@turf/turf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const boundaries = JSON.parse(
  readFileSync(path.join(__dirname, "../src/data/sejongBoundaries.json"), "utf8"),
);

const BUFFER_KM = 0.01; // 10m — 실좌표 스냅 오차를 흡수하기 위한 최소 버퍼
const buffered = boundaries.features.map((feature) => turf.buffer(feature, BUFFER_KM, { units: "kilometers" }));

const neighbors = Object.fromEntries(boundaries.features.map((f) => [f.properties.id, new Set()]));

for (let i = 0; i < boundaries.features.length; i += 1) {
  for (let j = i + 1; j < boundaries.features.length; j += 1) {
    if (!turf.booleanIntersects(buffered[i], buffered[j])) continue;
    const idA = boundaries.features[i].properties.id;
    const idB = boundaries.features[j].properties.id;
    neighbors[idA].add(idB);
    neighbors[idB].add(idA);
  }
}

const output = Object.fromEntries(
  Object.entries(neighbors).map(([id, set]) => [id, [...set]]),
);

console.log(JSON.stringify(output, null, 2));
