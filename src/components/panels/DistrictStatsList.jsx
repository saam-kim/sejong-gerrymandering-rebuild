import { PARTIES } from "../../data/sejongAreas";

export default function DistrictStatsList({
  districtColors,
  results,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  activeDistrictId,
  onSelect,
}) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {results.map((result) => {
        const theme = districtColors[result.districtId];
        const totalVotes = result.votes.DEM + result.votes.PPP;
        const winnerParty = PARTIES.find((p) => p.id === result.winner);
        const isActive = onSelect && result.districtId === activeDistrictId;
        const Tag = onSelect ? "button" : "div";
        return (
          <Tag
            key={result.districtId}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(result.districtId) : undefined}
            className={`rounded-xl border border-gray-100 border-l-4 bg-gray-50 p-3 text-left transition ${
              onSelect ? "w-full hover:bg-gray-100" : ""
            } ${isActive ? "shadow-[0_0_0_3px_rgba(15,23,42,0.08)]" : ""}`}
            style={{ borderLeftColor: theme.color, background: isActive ? theme.soft : undefined }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-black" style={{ color: theme.color }}>
                {theme.name}
                {isActive && (
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black" style={{ color: theme.color }}>
                    칠하는 중
                  </span>
                )}
              </p>
              {winnerParty && (
                <span className="text-[11px] font-black" style={{ color: winnerParty.color }}>
                  {winnerParty.shortName} 우세
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-bold text-gray-600">인구 {result.population.toLocaleString()}명</p>
            <p className="text-xs font-medium text-gray-500">
              {result.areaNames.length > 0 ? result.areaNames.join(", ") : "아직 배정된 지역 없음"}
            </p>
            {totalVotes > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {PARTIES.map((party) => {
                  const pct = Math.round((result.votes[party.id] / totalVotes) * 100);
                  return (
                    <div key={party.id} className="flex items-center gap-2 text-xs">
                      <span className="w-10 shrink-0 font-black" style={{ color: party.color }}>
                        {party.shortName}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: party.color }} />
                      </div>
                      <span className="w-8 shrink-0 text-right font-bold text-gray-500">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
