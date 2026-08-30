export default function ConnectionBanner({ connected, error }) {
  if (!error && connected !== false) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-red-600 px-4 py-2 text-center text-xs font-black text-white">
      <span>
        {error
          ? "실시간 서버 연결에 문제가 있습니다. 저장·제출이 반영되지 않을 수 있습니다."
          : "인터넷 연결이 끊겼습니다. 연결이 돌아올 때까지 이 화면을 닫지 마세요."}
      </span>
      <button type="button" onClick={() => window.location.reload()} className="shrink-0 rounded-md bg-white/20 px-2 py-1">
        다시 연결
      </button>
    </div>
  );
}
