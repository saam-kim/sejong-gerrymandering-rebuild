import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f172a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(79,70,229,0.32),transparent_70%)]" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-indigo-500/40 bg-indigo-600/20 px-4 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-200">
            Sejong Gerrymandering
          </span>
          <h1 className="mt-6 text-5xl font-black leading-[1.08] text-white sm:text-6xl">지도를 훔친 자들</h1>
          <p className="mt-4 text-lg font-black text-indigo-200 sm:text-xl">세종시 게리맨더링 시뮬레이션</p>
          <p className="mx-auto mt-5 max-w-lg text-sm font-semibold leading-6 text-white/55 sm:text-base">
            세종시 읍·면·동 지도를 다시 나누며, 같은 표가 선거구 획정에 따라 전혀 다른 결과로
            바뀌는 순간을 직접 실험합니다.
          </p>

          <div className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/join")}
              className="group relative overflow-hidden rounded-[20px] border border-transparent bg-gradient-to-br from-indigo-700 to-indigo-600 p-7 text-left shadow-[0_8px_32px_rgba(79,70,229,.38)] transition hover:-translate-y-1 hover:shadow-[0_14px_42px_rgba(79,70,229,.5)]"
            >
              <span className="text-3xl" aria-hidden="true">🗺️</span>
              <span className="mt-4 block text-xl font-black">학생(모둠)으로 참여</span>
              <span className="mt-2 block text-sm font-bold leading-6 text-white/75">
                PIN을 입력하고 모둠과 함께 지도를 그려보세요.
              </span>
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black text-white/35 transition group-hover:text-white/60">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/teacher/new")}
              className="group relative overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.06] p-7 text-left shadow-[0_4px_20px_rgba(0,0,0,.3)] transition hover:-translate-y-1 hover:bg-white/[0.1] hover:shadow-[0_10px_32px_rgba(0,0,0,.4)]"
            >
              <span className="text-3xl" aria-hidden="true">📺</span>
              <span className="mt-4 block text-xl font-black">교사로 시작</span>
              <span className="mt-2 block text-sm font-bold leading-6 text-white/60">
                수업 방을 만들고 모둠 결과를 비교하세요.
              </span>
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-black text-white/30 transition group-hover:text-white/55">
                →
              </span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
