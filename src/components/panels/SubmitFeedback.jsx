function successSubtitle(round, result) {
  if (round === 2) {
    return `민주 ${result.seats.DEM}석 · 국힘 ${result.seats.PPP}석으로 5석 중 4석 몰아주기에 성공했습니다.`;
  }
  if (round === 3) {
    return `득표율 대비 의석 왜곡도가 ${result.distortionScore.toFixed(2)}석으로 최소화됐습니다.`;
  }
  return "이 선거구 획정안을 최종 제출할까요? 제출 후에는 이번 라운드에서 수정할 수 없습니다.";
}

export default function SubmitFeedback({ result, round = 1, onClose, onConfirmSubmit, submitting = false, submitError = "" }) {
  if (!result) return null;

  const isSuccess = result.missionSuccess;

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {isSuccess ? (
          <>
            <p className="text-lg font-black text-emerald-600">조건을 모두 만족했습니다!</p>
            <p className="mt-1 text-sm font-bold text-gray-600">{successSubtitle(round, result)}</p>
            {round !== 1 && (
              <p className="mt-2 text-xs font-bold text-gray-500">제출 후에는 이번 라운드에서 수정할 수 없습니다.</p>
            )}
          </>
        ) : (
          <>
            <p className="text-lg font-black text-gray-900">아직 제출할 수 없어요</p>
            <ul className="mt-3 flex flex-col gap-2">
              {result.errors.map((message, index) => (
                <li key={index} className="flex gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  <span aria-hidden>⚠️</span>
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-black text-gray-700 hover:bg-gray-50"
          >
            {isSuccess ? "다시 확인하기" : "닫기"}
          </button>
          {isSuccess && (
            <button
              type="button"
              onClick={onConfirmSubmit}
              disabled={submitting}
              className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-black text-white hover:bg-gray-700 disabled:cursor-wait disabled:opacity-50"
            >
              {submitting ? "제출하는 중..." : "최종 제출"}
            </button>
          )}
        </div>
        {submitError && <p className="mt-3 text-center text-sm font-black text-red-600">{submitError}</p>}
      </div>
    </div>
  );
}
