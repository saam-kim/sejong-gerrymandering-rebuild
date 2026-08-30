import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUND_ORDER, getNextRound, useRoom } from "../hooks/useRoom";
import { getRoundMeta } from "../lib/rounds";
import TeamStatusList from "../components/teacher/TeamStatusList";
import CompareGrid from "../components/teacher/CompareGrid";
import TimerControls from "../components/teacher/TimerControls";
import ArmedButton from "../components/ArmedButton";
import ConnectionBanner from "../components/ConnectionBanner";

export default function TeacherDashboard() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const {
    meta,
    teams,
    drafts,
    submissions,
    timer,
    loading,
    error,
    connected,
    exists,
    advanceRound,
    toggleTimer,
    addTime,
    resetTimer,
    removeTeam,
  } = useRoom(pin);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [isTeamListOpen, setIsTeamListOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const currentRound = meta?.currentRound || 1;
  const [viewRound, setViewRound] = useState(currentRound);

  // 교사가 다른 라운드를 보다가도, 실제 라운드가 넘어가면 새 라운드를 바로 따라가게 한다.
  useEffect(() => {
    setViewRound(currentRound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  if (loading) {
    return <CenteredMessage>불러오는 중...</CenteredMessage>;
  }

  if (error && !exists) {
    return <CenteredMessage>실시간 서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.</CenteredMessage>;
  }

  if (!exists) {
    return <CenteredMessage>존재하지 않는 방입니다.</CenteredMessage>;
  }

  const nextRound = getNextRound(currentRound);
  const teamCount = Object.keys(teams || {}).length;
  const submittedCount = Object.keys(submissions?.[currentRound] || {}).length;
  const progressPct = teamCount > 0 ? Math.round((submittedCount / teamCount) * 100) : 0;
  const isViewingLiveRound = viewRound === currentRound;

  function toggleSelect(teamId) {
    setSelectedTeamIds((prev) => {
      if (prev.includes(teamId)) return prev.filter((id) => id !== teamId);
      if (prev.length >= 4) return prev;
      return [...prev, teamId];
    });
  }

  function handleSelectViewRound(round) {
    setViewRound(round);
    setSelectedTeamIds([]);
  }

  async function runAction(action) {
    if (actionBusy) return;
    if (connected !== true) {
      setActionError("실시간 서버가 연결된 뒤 다시 시도해 주세요.");
      return;
    }
    setActionBusy(true);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(err.message || "요청을 반영하지 못했습니다. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setActionBusy(false);
    }
  }

  const teamListPanel = (
    <TeamStatusList
      teams={teams}
      drafts={drafts}
      submissions={submissions}
      round={viewRound}
      selectedTeamIds={selectedTeamIds}
      onToggleSelect={toggleSelect}
      onRemoveTeam={(teamId) => runAction(() => removeTeam(teamId))}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <ConnectionBanner connected={connected} error={error} />
      {actionError && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-black text-amber-900">{actionError}</div>
      )}
      <header className="flex flex-wrap items-center justify-between gap-3 bg-gray-950 px-4 py-3 text-white">
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-indigo-300">참가 PIN</p>
            <p className="text-2xl font-black leading-none tracking-[0.14em]">{pin}</p>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {ROUND_ORDER.filter((round) => round <= currentRound).map((round) => (
              <button
                key={round}
                type="button"
                onClick={() => handleSelectViewRound(round)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-black transition ${
                  round === viewRound
                    ? "border-indigo-400 bg-indigo-500/30 text-white"
                    : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {round}R{round === currentRound ? " · 진행중" : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TimerControls
            timer={timer}
            onToggle={() => runAction(toggleTimer)}
            onAddTime={(seconds) => runAction(() => addTime(seconds))}
            onReset={() => runAction(resetTimer)}
            disabled={actionBusy || connected !== true}
          />

          <div className="hidden flex-col items-center border-l border-white/10 px-4 sm:flex">
            <span className="text-xl font-black leading-none">{teamCount}</span>
            <span className="mt-0.5 text-[10px] font-extrabold text-indigo-300">모둠 접속</span>
          </div>
          <div className="hidden flex-col items-center border-l border-white/10 px-4 sm:flex">
            <span className="text-xl font-black leading-none text-emerald-300">
              {submittedCount}
              <span className="text-sm text-emerald-400/80">/{teamCount}</span>
            </span>
            <span className="mt-0.5 text-[10px] font-extrabold text-indigo-300">
              {currentRound}R 제출 완료 · {progressPct}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeamListOpen(true)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-black lg:hidden"
          >
            모둠 목록
          </button>
          <a
            href={`/teacher/${pin}/preview`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-black hover:bg-white/20"
          >
            👀 학생 화면 미리보기
          </a>
          <button
            type="button"
            disabled={selectedTeamIds.length === 0}
            onClick={() => navigate(`/teacher/${pin}/compare?teams=${selectedTeamIds.join(",")}&round=${viewRound}`)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-black disabled:opacity-40"
          >
            전체화면 비교
          </button>
          {nextRound && (
            <ArmedButton
              label={`${getRoundMeta(nextRound).name.split(" · ")[0]}로 넘어가기`}
              armedLabel="정말 넘어갈까요? (모두 초기화됨)"
              onConfirm={() => runAction(() => advanceRound(nextRound))}
              disabled={actionBusy || connected !== true}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-500"
              armedClassName="rounded-lg bg-amber-500 px-4 py-2 text-sm font-black text-white"
            />
          )}
        </div>
      </header>

      {!isViewingLiveRound && (
        <div className="flex items-center justify-between bg-amber-50 px-4 py-2 text-xs font-black text-amber-800">
          <span>{getRoundMeta(viewRound).name} 결과를 돌아보는 중입니다 (지금 학생들은 {currentRound}라운드를 진행 중).</span>
          <button type="button" onClick={() => handleSelectViewRound(currentRound)} className="underline">
            현재 라운드로
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white lg:block">
          {teamListPanel}
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-3">
          <CompareGrid
            teams={teams}
            drafts={drafts}
            submissions={submissions}
            round={viewRound}
            selectedTeamIds={selectedTeamIds}
          />
        </main>
      </div>

      {isTeamListOpen && (
        <div className="fixed inset-0 z-20 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsTeamListOpen(false)} />
          <div className="relative ml-auto flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="font-black text-gray-900">모둠 목록</p>
              <button type="button" onClick={() => setIsTeamListOpen(false)} className="font-bold text-gray-500">
                닫기
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{teamListPanel}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function CenteredMessage({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-600">{children}</div>;
}
