import { DISTRICT_THEME, calculateSeats } from "../../lib/districtRules";
import { PARTIES } from "../../data/sejongAreas";
import MapCanvas from "../map/MapCanvas";

const GRID_COLS = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 xl:grid-cols-3", 4: "sm:grid-cols-2" };

export default function CompareGrid({ teams, drafts, submissions, round, selectedTeamIds }) {
  if (selectedTeamIds.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm font-bold text-gray-400">
        왼쪽 모둠 목록에서 비교할 모둠을 선택하세요 (최대 4개)
      </div>
    );
  }

  return (
    <div className={`grid h-full gap-3 ${GRID_COLS[selectedTeamIds.length] || ""}`}>
      {selectedTeamIds.map((teamId) => {
        const team = teams[teamId];
        const submission = submissions?.[round]?.[teamId];
        const draft = drafts?.[round]?.[teamId];
        const assignments = submission?.assignments || draft?.assignments || {};
        const seats = submission ? calculateSeats(submission.assignments) : null;

        return (
          <div key={teamId} className="flex min-h-64 flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <p className="truncate text-sm font-black text-gray-900">{team?.teamName || teamId}</p>
              {seats && (
                <div className="flex shrink-0 gap-1.5">
                  {PARTIES.map((party) => (
                    <span
                      key={party.id}
                      className="rounded-md px-1.5 py-0.5 text-[11px] font-black"
                      style={{ background: party.soft, color: party.color }}
                    >
                      {party.shortName} {seats[party.id]}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="min-h-0 flex-1 p-2">
              <MapCanvas assignments={assignments} districtColors={DISTRICT_THEME} readOnly />
            </div>
          </div>
        );
      })}
    </div>
  );
}
