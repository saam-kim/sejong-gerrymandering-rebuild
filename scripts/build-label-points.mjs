// src/data/sejongBoundaries.json의 각 지역에 라벨을 놓을 좌표(labelPoint)를 다시 계산해
// 파일에 직접 기록한다. 단순 중심점(centroid)이나 "내부의 아무 점"(pointOnFeature) 대신
// "폴리곤 안에서 가장자리로부터 가장 먼 점"(pole of inaccessibility, polylabel)을 사용해
// 라벨이 행정경계를 넘어가거나 옆 지역과 겹치지 않도록 한다.
// 실행: node scripts/build-label-points.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as turf from "@turf/turf";
import polylabel from "polylabel";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const boundariesPath = path.join(__dirname, "../src/data/sejongBoundaries.json");
const boundaries = JSON.parse(readFileSync(boundariesPath, "utf8"));

function largestPolygonRings(feature) {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  let best = null;
  let bestArea = -1;
  for (const rings of polygons) {
    const area = Math.abs(turf.area(turf.polygon(rings)));
    if (area > bestArea) {
      bestArea = area;
      best = rings;
    }
  }
  return best;
}

for (const feature of boundaries.features) {
  const rings = largestPolygonRings(feature);
  const [x, y] = polylabel(rings, 0.00003); // ~3m 정밀도
  feature.properties.labelPoint = [x, y];
}

writeFileSync(boundariesPath, JSON.stringify(boundaries));
console.log(`labelPoint 재계산 완료 (${boundaries.features.length}개 지역) → ${boundariesPath}`);
