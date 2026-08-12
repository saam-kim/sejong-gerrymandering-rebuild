import { useEffect, useState } from "react";

function computeRemainingMs(timer) {
  if (!timer) return 0;
  if (timer.running) return Math.max(0, (timer.endsAt ?? Date.now()) - Date.now());
  return Math.max(0, timer.remainingMs ?? 0);
}

/**
 * Firebase에 저장된 타이머(meta.timer)로부터 매 초 남은 시간을 읽기 전용으로 계산한다.
 * running 상태일 때만 로컬에서 1초마다 재계산하고, 정지 상태면 값이 그대로 고정된다.
 */
export function useCountdown(timer) {
  const [remainingMs, setRemainingMs] = useState(() => computeRemainingMs(timer));

  useEffect(() => {
    setRemainingMs(computeRemainingMs(timer));
    if (!timer?.running) return undefined;

    const interval = setInterval(() => {
      setRemainingMs(computeRemainingMs(timer));
    }, 250);
    return () => clearInterval(interval);
  }, [timer?.running, timer?.endsAt, timer?.remainingMs]);

  const totalMs = (timer?.durationSeconds || 0) * 1000;
  const fraction = totalMs > 0 ? remainingMs / totalMs : 0;

  return { remainingMs, fraction, isRunning: Boolean(timer?.running) };
}
