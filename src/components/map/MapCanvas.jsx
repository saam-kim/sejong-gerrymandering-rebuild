import { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom as d3zoom, zoomIdentity } from "d3-zoom";
import { boundaries, pathGenerator, VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from "./projection";
import { AREA_BY_ID } from "../../data/sejongAreas";
import downtownOutline from "../../data/downtownOutline.json";
import AreaTooltip from "./AreaTooltip";

const ZOOM_EXTENT = [1, 8];
// 행정중심복합도시(행복도시) — 서로 붙어 있어 축소 상태에서는 이름이 겹치는 밀집 동 12곳.
// 이 지역들은 DETAIL_ZOOM_THRESHOLD 이상으로 확대했을 때만 개별 라벨/호버 정보를 보여준다.
const DOWNTOWN_IDS = new Set([
  "hansol", "saerom", "dodam", "haemil", "areum", "jongchon",
  "goun", "sodam", "bangok", "boram", "daepyeong", "dajeong",
]);
const DETAIL_ZOOM_THRESHOLD = 2.2;
const TOUCH_TOOLTIP_MS = 2600;
const UNASSIGNED_FILL = "#E5E7EB";

export default function MapCanvas({
  assignments,
  districtColors,
  onAreaTap,
  readOnly = false,
  onViewportChange,
}) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const touchTimerRef = useRef(null);

  const [transform, setTransform] = useState(zoomIdentity);
  const [tooltip, setTooltip] = useState(null); // { areaId, x, y, sticky }
  const [showZoomHint, setShowZoomHint] = useState(false);
  const isDetailZoom = transform.k >= DETAIL_ZOOM_THRESHOLD;

  useEffect(() => {
    const svg = select(svgRef.current);
    const zoomBehavior = d3zoom()
      .scaleExtent(ZOOM_EXTENT)
      .clickDistance(6) // 살짝 흔들리는 터치 탭도 클릭으로 인정
      .on("zoom", (event) => {
        setTransform(event.transform);
        onViewportChange?.(event.transform);
      });

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    return () => {
      svg.on(".zoom", null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previousScaleRef = useRef(1);
  useEffect(() => {
    const crossedZoomInThreshold = previousScaleRef.current < DETAIL_ZOOM_THRESHOLD && transform.k >= DETAIL_ZOOM_THRESHOLD;
    if (crossedZoomInThreshold) {
      setShowZoomHint(true);
      const timer = setTimeout(() => setShowZoomHint(false), 2200);
      previousScaleRef.current = transform.k;
      return () => clearTimeout(timer);
    }
    previousScaleRef.current = transform.k;
    return undefined;
  }, [transform.k]);

  const { visibleLabels, clusterLabel } = useMemo(() => {
    if (isDetailZoom) {
      return { visibleLabels: boundaries.features, clusterLabel: null };
    }

    const individual = boundaries.features.filter((feature) => !DOWNTOWN_IDS.has(feature.properties.id));
    const [clusterX, clusterY] = projectPoint(downtownOutline.properties.labelPoint);
    const cluster = { x: clusterX, y: clusterY };

    return { visibleLabels: individual, clusterLabel: cluster };
  }, [isDetailZoom]);

  function fillForArea(areaId) {
    const districtId = assignments?.[areaId];
    if (!districtId) return UNASSIGNED_FILL;
    return districtColors[districtId]?.color || UNASSIGNED_FILL;
  }

  function isHoverable(areaId) {
    return isDetailZoom || !DOWNTOWN_IDS.has(areaId);
  }

  function handlePointerEnter(areaId, event) {
    if (event.pointerType !== "mouse" || !isHoverable(areaId)) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({ areaId, x: event.clientX - rect.left, y: event.clientY - rect.top, sticky: false });
  }

  function handlePointerMove(areaId, event) {
    if (event.pointerType !== "mouse" || !isHoverable(areaId)) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({ areaId, x: event.clientX - rect.left, y: event.clientY - rect.top, sticky: false });
  }

  function handlePointerLeave() {
    setTooltip((current) => (current?.sticky ? current : null));
  }

  function handlePointerUp(areaId, event) {
    if (event.pointerType === "mouse" || !isHoverable(areaId)) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({ areaId, x: event.clientX - rect.left, y: event.clientY - rect.top, sticky: true });
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => setTooltip(null), TOUCH_TOOLTIP_MS);
  }

  function handleClick(areaId) {
    if (readOnly) return;
    if (!isDetailZoom && DOWNTOWN_IDS.has(areaId)) {
      jumpToDowntown();
      return;
    }
    onAreaTap?.(areaId);
  }

  function zoomBy(factor) {
    const svg = select(svgRef.current);
    svg.transition().duration(200).call(zoomBehaviorRef.current.scaleBy, factor);
  }

  function resetView() {
    const svg = select(svgRef.current);
    svg.transition().duration(250).call(zoomBehaviorRef.current.transform, zoomIdentity);
  }

  function jumpToDowntown() {
    if (!clusterLabel) return;
    const targetK = 3;
    const targetTransform = zoomIdentity
      .translate(VIEWBOX_WIDTH / 2 - clusterLabel.x * targetK, VIEWBOX_HEIGHT / 2 - clusterLabel.y * targetK)
      .scale(targetK);
    const svg = select(svgRef.current);
    svg.transition().duration(350).call(zoomBehaviorRef.current.transform, targetTransform);
  }

  const isZoomedIn = transform.k > 1.05;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-sky-50">
      {!readOnly && (
        <div className="absolute left-3 top-3 z-10">
          {clusterLabel ? (
            <button
              type="button"
              onClick={jumpToDowntown}
              className="rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-black text-gray-700 shadow-sm hover:bg-gray-50"
            >
              🔍 행정중심복합도시 확대
            </button>
          ) : isZoomedIn ? (
            <button
              type="button"
              onClick={resetView}
              className="rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs font-black text-gray-700 shadow-sm hover:bg-gray-50"
            >
              ↺ 전체 보기
            </button>
          ) : null}
        </div>
      )}

      {!readOnly && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-gray-200">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.4)}
            disabled={transform.k <= ZOOM_EXTENT[0]}
            aria-label="지도 축소"
            className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-black text-gray-700 disabled:opacity-30"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="지도 보기 초기화"
            className="flex h-9 min-w-11 items-center justify-center rounded-md px-1 text-[11px] font-black text-gray-600"
          >
            {Math.round(transform.k * 100)}%
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.4)}
            disabled={transform.k >= ZOOM_EXTENT[1]}
            aria-label="지도 확대"
            className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-black text-gray-700 disabled:opacity-30"
          >
            +
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="h-full w-full touch-none select-none"
        role="img"
        aria-label="세종특별자치시 읍면동 지도"
      >
        <g ref={gRef} transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {boundaries.features.map((feature) => {
            const areaId = feature.properties.id;
            return (
              <path
                key={areaId}
                data-area-id={areaId}
                d={pathGenerator(feature)}
                fill={fillForArea(areaId)}
                stroke="#ffffff"
                strokeWidth={1.2 / transform.k}
                className={readOnly ? "" : "cursor-pointer"}
                onPointerEnter={(event) => handlePointerEnter(areaId, event)}
                onPointerMove={(event) => handlePointerMove(areaId, event)}
                onPointerLeave={handlePointerLeave}
                onPointerUp={(event) => handlePointerUp(areaId, event)}
                onClick={() => handleClick(areaId)}
              />
            );
          })}

          {!isDetailZoom && (
            <path
              d={pathGenerator(downtownOutline)}
              fill="none"
              stroke="#4B5563"
              strokeWidth={3 / transform.k}
              className="pointer-events-none"
            />
          )}

          {visibleLabels.map((feature) => {
            const [x, y] = projectPoint(feature.properties.labelPoint);
            return (
              <text
                key={feature.properties.id}
                x={x}
                y={y}
                fontSize={11 / transform.k}
                fontWeight="700"
                textAnchor="middle"
                className="pointer-events-none fill-gray-950"
                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3.5 / transform.k }}
              >
                {feature.properties.name}
              </text>
            );
          })}

          {clusterLabel && (
            <g className="pointer-events-none" transform={`translate(${clusterLabel.x},${clusterLabel.y})`}>
              <text
                fontSize={13 / transform.k}
                textAnchor="middle"
                fontWeight="800"
                className="fill-gray-950"
                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 4.5 / transform.k }}
              >
                행정중심복합도시
              </text>
              <text
                y={14 / transform.k}
                fontSize={9 / transform.k}
                textAnchor="middle"
                fontWeight="600"
                className="fill-gray-700"
                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3.5 / transform.k }}
              >
                확대하면 각 동이 나타납니다
              </text>
            </g>
          )}
        </g>
      </svg>

      {tooltip && (
        <AreaTooltip
          area={AREA_BY_ID[tooltip.areaId]}
          x={tooltip.x}
          y={tooltip.y}
          assignedDistrictName={
            assignments?.[tooltip.areaId] ? districtColors[assignments[tooltip.areaId]]?.name : null
          }
        />
      )}

      {showZoomHint && (
        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-gray-900/85 px-4 py-1.5 text-xs font-medium text-white shadow">
          확대됨 — 미니맵에서 전체 위치를 확인할 수 있어요
        </div>
      )}
    </div>
  );
}

function projectPoint(lonLat) {
  // pathGenerator와 같은 projection을 사용해 labelPoint를 화면 좌표로 변환한다.
  return pathGenerator.projection()(lonLat);
}
