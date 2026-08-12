const RULES = [
  {
    icon: "🧩",
    color: "#4F46E5",
    soft: "#EEF2FF",
    title: "인접 조건",
    desc: "같은 선거구로 묶은 지역들은 반드시 서로 붙어 있어야 해요. 뚝 떨어진 지역끼리는 한 선거구로 묶을 수 없어요.",
  },
  {
    icon: "⚖️",
    color: "#0E9594",
    soft: "#E4F5F5",
    title: "인구 조건",
    desc: "선거구 하나의 인구는 60,000명~110,000명 사이여야 해요. 너무 적거나 많으면 안 돼요.",
  },
];

export default function RulesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 bg-gradient-to-br from-indigo-700 to-indigo-600 px-5 py-4 text-white">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl">📐</div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-200">지켜야 할 규칙</p>
            <h2 className="text-lg font-black leading-tight">선거구는 이렇게 만들어요</h2>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-5 py-4">
          {RULES.map((rule) => (
            <div key={rule.title} className="flex gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{ background: rule.soft }}
              >
                {rule.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black" style={{ color: rule.color }}>
                  {rule.title}
                </p>
                <p className="mt-0.5 text-xs font-bold leading-5 text-gray-600">{rule.desc}</p>
              </div>
            </div>
          ))}
          <p className="px-1 text-xs font-bold text-gray-400">
            규칙을 어기면 제출할 때 어디가 왜 안 되는지 바로 알려드려요.
          </p>
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-600 text-base font-black text-white shadow-[0_8px_24px_rgba(79,70,229,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(79,70,229,.45)]"
          >
            지도 그리러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
