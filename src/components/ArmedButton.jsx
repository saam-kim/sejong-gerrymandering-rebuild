import { useEffect, useRef, useState } from "react";

const ARM_TIMEOUT_MS = 3500;

/**
 * 되돌리기 어려운 동작(전체 초기화, 라운드 전환 등)을 위한 2단계 확인 버튼.
 * 첫 클릭은 "정말 진행할까요?" 상태로 무장(arm)만 하고, 지정 시간 안에 다시 누르면 실행한다.
 * 브라우저 기본 confirm() 대화상자보다 화면 흐름을 끊지 않는다.
 */
export default function ArmedButton({ label, armedLabel, onConfirm, className = "", armedClassName = "" }) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleClick() {
    if (!armed) {
      setArmed(true);
      timerRef.current = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS);
      return;
    }
    clearTimeout(timerRef.current);
    setArmed(false);
    onConfirm();
  }

  return (
    <button type="button" onClick={handleClick} className={armed ? armedClassName || className : className}>
      {armed ? armedLabel : label}
    </button>
  );
}
