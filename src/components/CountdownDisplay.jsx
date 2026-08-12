import { useCountdown } from "../hooks/useCountdown";

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function CountdownDisplay({ timer, size = "md" }) {
  const { remainingMs, fraction, isRunning } = useCountdown(timer);
  if (!timer) return null;

  const isLow = fraction <= 0.2;
  const isMid = fraction <= 0.4;
  const colorClass = isLow ? "text-red-600 bg-red-50" : isMid ? "text-amber-600 bg-amber-50" : "text-gray-900 bg-gray-100";
  const isSmall = size === "sm";

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl px-3 font-black tabular-nums ${colorClass} ${
        isSmall ? "h-9 text-sm" : "h-11 text-lg"
      }`}
    >
      <span aria-hidden>{isRunning ? "⏱" : "⏸"}</span>
      {formatTime(remainingMs)}
    </div>
  );
}
