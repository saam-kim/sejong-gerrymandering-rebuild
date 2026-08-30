import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { getRoundMeta } from "../lib/rounds";
import CompareGrid from "../components/teacher/CompareGrid";
import ConnectionBanner from "../components/ConnectionBanner";

export default function TeacherCompareFullscreen() {
  const { pin } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { meta, teams, drafts, submissions, loading, error, connected, exists } = useRoom(pin);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-300">불러오는 중...</div>;
  }

  if (error && !exists) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-300">실시간 서버에 연결하지 못했습니다.</div>;
  }

  if (!exists) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-900 text-gray-300">존재하지 않는 방입니다.</div>;
  }

  const currentRound = meta?.currentRound || 1;
  const round = Number(searchParams.get("round")) || currentRound;
  const roundMeta = getRoundMeta(round);
  const selectedTeamIds = (searchParams.get("teams") || "").split(",").filter(Boolean);

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <ConnectionBanner connected={connected} error={error} />
      <header className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-300">Comparison View</p>
          <p className="text-lg font-black text-white">{roundMeta.name}</p>
          <p className="text-sm font-bold text-gray-400">PIN {pin}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/teacher/${pin}`)}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20"
        >
          대시보드로 돌아가기
        </button>
      </header>

      <main className="min-h-0 flex-1 px-6 pb-6">
        <CompareGrid
          teams={teams}
          drafts={drafts}
          submissions={submissions}
          round={round}
          selectedTeamIds={selectedTeamIds}
        />
      </main>
    </div>
  );
}
