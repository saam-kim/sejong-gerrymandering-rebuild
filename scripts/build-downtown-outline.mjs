// 행정중심복합도시(밀집 다운타운) 12개 동 폴리곤을 하나로 합쳐(union) 외곽선만 남긴
// src/data/downtownOutline.json을 만든다. 지도가 축소된 상태에서 다운타운 전체를
// 굵은 테두리로 표시해 나머지 지역과 시각적으로 구분하고, 그 라벨("행정중심복합도시")을
// 합쳐진 모양 안에서 가장자리로부터 가장 먼 점(pole of inaccessibility)에 놓기 위해 쓴다.
// d3-geo가 요구하는 시계방향 링 감김(이 프로젝트의 다른 지오메트리와 동일)으로 맞춘다.
// 실행: node scripts/build-downtown-outline.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as turf from "@turf/turf";
import polylabel from "polylabel";

const DOWNTOWN_IDS = new Set([
  "hansol", "saerom", "dodam", "haemil", "areum", "jongchon",
  "goun", "sodam", "bangok", "boram", "daepyeong", "dajeong",
]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const boundaries = JSON.parse(
  readFileSync(path.join(__dirname, "../src/data/sejongBoundaries.json"), "utf8"),
);

const downtownFeatures = boundaries.features.filter((f) => DOWNTOWN_IDS.has(f.properties.id));
const merged = turf.union(turf.featureCollection(downtownFeatures));
const rewound = turf.rewind({ type: "Feature", properties: {}, geometry: merged.geometry }, { reverse: true, mutate: false });

function largestPolygonRings(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
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

const labelPoint = polylabel(largestPolygonRings(rewound.geometry), 0.00003);
rewound.properties.labelPoint = labelPoint;

const outputPath = path.join(__dirname, "../src/data/downtownOutline.json");
writeFileSync(outputPath, JSON.stringify(rewound));
console.log(`행정중심복합도시 외곽선 + 라벨 위치 저장 완료 → ${outputPath}`);
