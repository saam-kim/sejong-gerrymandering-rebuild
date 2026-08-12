const POINTS = [
  "여러분이 지도 위에 선 하나를 어떻게 긋느냐에 따라, 똑같은 표로도 완전히 다른 결과가 나올 수 있어요.",
  "이번 활동에 나오는 인구와 득표수는 전부 세종시의 진짜 데이터예요 — 지어낸 숫자는 하나도 없어요.",
  "선 긋는 사람이 결과를 바꿀 수 있다는 것, 그게 바로 게리맨더링이에요.",
];

export default function IntroModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-gradient-to-br from-indigo-700 to-indigo-600 px-5 py-4 text-white">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl">🗺️</div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-200">지도를 훔친 자들</p>
            <h2 className="text-lg font-black leading-tight">이 활동은 왜 하는 걸까요?</h2>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-5 py-4">
          {POINTS.map((point, index) => (
            <div key={point} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-black text-indigo-700">
                {index + 1}
              </span>
              <p className="text-sm font-bold leading-6 text-gray-700">{point}</p>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-600 text-base font-black text-white shadow-[0_8px_24px_rgba(79,70,229,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,70,229,.45)]"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
