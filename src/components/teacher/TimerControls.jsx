import CountdownDisplay from "../CountdownDisplay";

export default function TimerControls({ timer, onToggle, onAddTime, onReset, disabled = false }) {
  if (!timer) return null;

  return (
    <div className="flex items-center gap-1.5">
      <CountdownDisplay timer={timer} />
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={timer.running ? "일시정지" : "시작"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-sm font-black text-white hover:bg-white/20"
      >
        {timer.running ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        onClick={() => onAddTime(-60)}
        disabled={disabled}
        className="hidden h-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-black text-white hover:bg-white/20 sm:flex"
      >
        −1분
      </button>
      <button
        type="button"
        onClick={() => onAddTime(60)}
        disabled={disabled}
        className="flex h-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-2 text-xs font-black text-white hover:bg-white/20"
      >
        +1분
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        aria-label="타이머 초기화"
        className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-sm font-black text-white hover:bg-white/20 sm:flex"
      >
        ↺
      </button>
    </div>
  );
}
