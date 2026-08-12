import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../hooks/useRoom";
import FirebaseSettingsPanel from "../components/teacher/FirebaseSettingsPanel";

const ROUNDS = [
  { name: "1라운드 · 기본 획정", desc: "인접 조건과 인구 60,000~110,000명 조건을 만족하는 5개 선거구 획정" },
  { name: "2라운드 · 의석 뒤집기", desc: "같은 조건 안에서 한 정당이 5석 중 4석을 갖도록 설계" },
  { name: "3라운드 · 공정성 회복", desc: "득표율과 의석 비율의 차이를 최소화하는 지도로 재설계" },
];

export default function TeacherCreate() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreateRoom() {
    setCreating(true);
    setCreateError("");
    try {
      const pin = await createRoom();
      navigate(`/teacher/${pin}`);
    } catch (err) {
      setCreateError(err.message || "방을 만들지 못했습니다.");
      setCreating(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f172a] px-5 py-12 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(79,70,229,0.28),transparent_70%)]" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col gap-6">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-300">지도를 훔친 자들</p>
          <h1 className="mt-2 text-3xl font-black text-white">새 수업 방 만들기</h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
          <h2 className="mb-3 text-sm font-black uppercase tracking-[0.08em] text-indigo-200">라운드 순서</h2>
          <ol className="flex flex-col gap-3">
            {ROUNDS.map((round, index) => (
              <li key={round.name} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-black text-white">{round.name}</p>
                  <p className="mt-1 text-sm font-bold text-white/50">{round.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
          <FirebaseSettingsPanel />
        </div>

        {createError && <p className="text-center text-sm font-black text-red-400">{createError}</p>}

        <button
          type="button"
          onClick={handleCreateRoom}
          disabled={creating}
          className="flex h-[64px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-600 text-lg font-black text-white shadow-[0_8px_32px_rgba(79,70,229,.38)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_42px_rgba(79,70,229,.5)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? "방을 여는 중..." : "방 열기"}
        </button>
      </div>
    </main>
  );
}
