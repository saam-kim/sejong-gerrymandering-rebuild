import { calculateSeats } from "../../lib/districtRules";
import { PARTIES } from "../../data/sejongAreas";
import ArmedButton from "../ArmedButton";

const STATUS_STYLE = {
  submitted: { label: "제출 완료", badge: "bg-emerald-100 text-emerald-700", border: "#10B981" },
  progress: { label: "진행중", badge: "bg-amber-100 text-amber-700", border: "#F59E0B" },
  waiting: { label: "대기", badge: "bg-gray-100 text-gray-500", border: "#D1D5DB" },
};

export default function TeamStatusList({ teams, drafts, submissions, round, selectedTeamIds, onToggleSelect, onRemoveTeam }) {
  const teamEntries = Object.entries(teams || {});

  if (teamEntries.length === 0) {
    return (
      <p className="p-4 text-center text-sm font-bold text-gray-400">
        아직 참가한 모둠이 없습니다.
        <br />
        학생들에게 PIN을 알려주세요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2 p-2">
      {teamEntries.map(([teamId, team]) => {
        const submission = submissions?.[round]?.[teamId];
        const draft = drafts?.[round]?.[teamId];
        const assignments = submission?.assignments || draft?.assignments;
        const assignedCount = assignments ? Object.values(assignments).filter(Boolean).length : 0;
        // 배정이 하나도 없는 빈 초안은 자동저장이 즉시 만들어내므로("진행중"으로 오판하지 않도록)
        // 실제로 뭔가 배정된 경우에만 "진행중"으로 본다.
        const statusKey = submission ? "submitted" : assignedCount > 0 ? "progress" : "waiting";
        const status = STATUS_STYLE[statusKey];
        const seats = submission ? calculateSeats(submission.assignments) : null;
        const isSelected = selectedTeamIds.includes(teamId);

        return (
          <li key={teamId} className="flex items-stretch gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSelect(teamId)}
              className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border-l-4 bg-gray-50 px-3 py-2.5 text-left transition hover:bg-gray-100 ${
                isSelected ? "ring-2 ring-indigo-400" : ""
              }`}
              style={{ borderLeftColor: status.border }}
            >
              <input type="checkbox" checked={isSelected} readOnly className="h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-gray-900">{team.teamName}</p>
                <p className="truncate text-[11px] font-bold text-gray-500">
                  {statusKey === "progress" ? `배정 ${assignedCount}/22` : status.label}
                </p>
              </div>
              {seats ? (
                <div className="flex shrink-0 items-center gap-1 text-[11px] font-black">
                  {PARTIES.map((party) => (
                    <span key={party.id} className="rounded-md px-1.5 py-1" style={{ background: party.soft, color: party.color }}>
                      {seats[party.id]}
                    </span>
                  ))}
                </div>
              ) : (
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${status.badge}`}>{status.label}</span>
              )}
            </button>

            {onRemoveTeam && (
              <ArmedButton
                label="✕"
                armedLabel="삭제?"
                onConfirm={() => onRemoveTeam(teamId)}
                className="w-9 shrink-0 rounded-xl border border-gray-200 bg-white text-sm font-black text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                armedClassName="w-9 shrink-0 whitespace-nowrap rounded-xl border border-red-300 bg-red-50 px-1 text-[10px] font-black text-red-700"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
