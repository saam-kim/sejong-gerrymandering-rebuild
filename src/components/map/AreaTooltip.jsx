import { PARTIES } from "../../data/sejongAreas";

// 카드 높이가 대략 이 정도라서, 위쪽에 이만큼 공간이 없으면(예: 지도 상단부 지역) 커서 아래로 뒤집어 띄운다.
const CARD_HEIGHT_ESTIMATE = 170;

export default function AreaTooltip({ area, x, y, assignedDistrictName }) {
  if (!area) return null;

  const totalVotes = area.votes.DEM + area.votes.PPP;
  const flipBelow = y < CARD_HEIGHT_ESTIMATE;

  return (
    <div
      className={`pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-xl bg-white p-3 text-left shadow-lg ring-1 ring-black/5 ${
        flipBelow ? "" : "-translate-y-full"
      }`}
      style={{ left: x, top: flipBelow ? y + 16 : y - 12 }}
    >
      <p className="text-sm font-black text-gray-900">{area.name}</p>
      <p className="mt-0.5 text-xs font-bold text-gray-500">인구 {area.population.toLocaleString()}명</p>

      <div className="mt-2 flex flex-col gap-1">
        {PARTIES.map((party) => {
          const votes = area.votes[party.id];
          const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
          return (
            <div key={party.id} className="flex items-center gap-2 text-xs">
              <span className="w-10 shrink-0 font-black" style={{ color: party.color }}>
                {party.shortName}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: party.color }} />
              </div>
              <span className="w-8 shrink-0 text-right font-bold text-gray-500">{pct}%</span>
            </div>
          );
        })}
      </div>

      {assignedDistrictName && (
        <p className="mt-2 text-xs font-black text-gray-700">현재 배정: {assignedDistrictName}</p>
      )}
    </div>
  );
}
