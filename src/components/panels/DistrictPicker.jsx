export default function DistrictPicker({ districts, districtColors, activeDistrictId, onSelect, results }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-1 py-1">
      {districts.map((districtId) => {
        const theme = districtColors[districtId];
        const result = results.find((r) => r.districtId === districtId);
        const isActive = districtId === activeDistrictId;
        return (
          <button
            key={districtId}
            type="button"
            onClick={() => onSelect(districtId)}
            className={`flex min-w-[96px] shrink-0 flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2 text-left transition ${
              isActive ? "shadow-[0_0_0_3px_rgba(15,23,42,0.06)]" : "hover:bg-gray-50"
            }`}
            style={{
              borderColor: theme.color,
              background: isActive ? theme.soft : "#FFFFFF",
            }}
          >
            <span className="flex items-center gap-1.5 text-sm font-black" style={{ color: theme.color }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: theme.color }} />
              {theme.name}
            </span>
            <span className="text-[11px] font-bold text-gray-500">
              {result?.areaIds.length || 0}개 지역 · {(result?.population || 0).toLocaleString()}명
            </span>
          </button>
        );
      })}
    </div>
  );
}
