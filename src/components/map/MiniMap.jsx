import { boundaries, pathGenerator, VIEWBOX_HEIGHT, VIEWBOX_WIDTH } from "./projection";

const UNASSIGNED_FILL = "#E5E7EB";

export default function MiniMap({ assignments, districtColors, transform }) {
  function fillForArea(areaId) {
    const districtId = assignments?.[areaId];
    if (!districtId) return UNASSIGNED_FILL;
    return districtColors[districtId]?.color || UNASSIGNED_FILL;
  }

  const k = transform?.k ?? 1;
  const x = transform?.x ?? 0;
  const y = transform?.y ?? 0;

  // 메인 지도와 동일한 좌표계를 쓰므로, 화면 뷰포트 [0,W]x[0,H]의 역변환으로
  // 미니맵 위 뷰포트 사각형을 그대로 얻을 수 있다.
  const viewport = {
    x: (0 - x) / k,
    y: (0 - y) / k,
    width: VIEWBOX_WIDTH / k,
    height: VIEWBOX_HEIGHT / k,
  };

  return (
    <div className="pointer-events-none w-28 overflow-hidden rounded-lg border border-gray-200 bg-white/90 shadow-sm sm:w-36">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-full w-full">
        {boundaries.features.map((feature) => (
          <path
            key={feature.properties.id}
            d={pathGenerator(feature)}
            fill={fillForArea(feature.properties.id)}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        ))}
        <rect
          x={viewport.x}
          y={viewport.y}
          width={viewport.width}
          height={viewport.height}
          fill="none"
          stroke="#111827"
          strokeWidth={4}
          rx={4}
        />
      </svg>
    </div>
  );
}
