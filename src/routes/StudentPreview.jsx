import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { getRoundMeta } from "../lib/rounds";
import {
  DISTRICTS,
  DISTRICT_THEME,
  calculateDistrictResults,
  calculateSeats,
  getEmptyAssignments,
  validatePlan,
} from "../lib/districtRules";
import { AREA_BY_ID } from "../data/sejongAreas";
import MapCanvas from "../components/map/MapCanvas";
import DistrictPicker from "../components/panels/DistrictPicker";
import DetailDrawer from "../components/panels/DetailDrawer";
import DistrictSidePanel from "../components/panels/DistrictSidePanel";
import SubmitFeedback from "../components/panels/SubmitFeedback";
import SeatPreview from "../components/panels/SeatPreview";
import CountdownDisplay from "../components/CountdownDisplay";
import IntroModal from "../components/panels/IntroModal";
import RulesModal from "../components/panels/RulesModal";
import ArmedButton from "../components/ArmedButton";
import ConnectionBanner from "../components/ConnectionBanner";

/**
 * 교사가 실제 모둠을 만들지 않고도 "학생 화면이 지금 어떻게 보이는지" 리허설해볼 수 있는
 * 미리보기 화면. useRoom으로 실제 라운드·타이머 정보는 그대로 읽어오지만, 배정/제출은
 * 전부 로컬 state에만 머물고 Firebase에는 아무것도 쓰지 않는다 — 그래서 모둠 목록에
 * 가짜 모둠이 남거나 실제 학생 제출 집계에 영향을 주는 일이 없다.
 */
export default function StudentPreview() {
  const { pin } = useParams();
  const { meta, timer, loading, error, connected, exists } = useRoom(pin);
  const [onboardingStep, setOnboardingStep] = useState("why");

  const currentRound = meta?.currentRound || 1;
  const roundMeta = getRoundMeta(currentRound);

  const [assignments, setAssignments] = useState(() => getEmptyAssignments());
  const [activeDistrictId, setActiveDistrictId] = useState(DISTRICTS[0]);
  const [validationResult, setValidationResult] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const hasMountedRoundRef = useRef(false);

  function showToast(text) {
    setToast(text);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  }

  // 실제 학생 화면처럼, 교사가 라운드를 넘기면 미리보기도 초기화된다.
  useEffect(() => {
    if (!hasMountedRoundRef.current) {
      hasMountedRoundRef.current = true;
      return;
    }
    setAssignments(getEmptyAssignments());
    setActiveDistrictId(DISTRICTS[0]);
    setValidationResult(null);
    setIsLocked(false);
    showToast(`${roundMeta.name}이 시작되었습니다.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound]);

  const results = useMemo(() => calculateDistrictResults(assignments), [assignments]);
  const seats = useMemo(() => calculateSeats(assignments), [assignments]);
  const totalUnassigned = useMemo(() => {
    const assignedIds = new Set(Object.entries(assignments).filter(([, v]) => v).map(([k]) => k));
    return Object.keys(getEmptyAssignments()).length - assignedIds.size;
  }, [assignments]);

  if (loading) {
    return <CenteredMessage>불러오는 중...</CenteredMessage>;
  }

  if (error && !exists) {
    return <CenteredMessage>실시간 서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 새로고침해 주세요.</CenteredMessage>;
  }

  if (!exists) {
    return <CenteredMessage>방을 찾을 수 없습니다. PIN을 다시 확인해 주세요.</CenteredMessage>;
  }

  function handleAreaTap(areaId) {
    if (isLocked) return;
    setAssignments((prev) => {
      const wasAssignedToActive = prev[areaId] === activeDistrictId;
      if (!wasAssignedToActive) {
        showToast(`${AREA_BY_ID[areaId]?.name}을(를) ${DISTRICT_THEME[activeDistrictId].name}에 배정했습니다.`);
      } else {
        showToast(`${AREA_BY_ID[areaId]?.name}을(를) 뺐습니다.`);
      }
      return { ...prev, [areaId]: wasAssignedToActive ? null : activeDistrictId };
    });
  }

  function handleResetAll() {
    setAssignments(getEmptyAssignments());
    showToast("모든 배정을 초기화했습니다.");
  }

  function handleSubmitAttempt() {
    const result = validatePlan(assignments, { round: currentRound });
    setValidationResult(result);
  }

  function handleConfirmSubmit() {
    setIsLocked(true);
    setValidationResult(null);
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <ConnectionBanner connected={connected} error={error} />
      <div className="flex items-center justify-between gap-3 bg-indigo-950 px-4 py-1.5 text-xs font-black text-indigo-100">
        <span>👀 미리보기 모드 — 여기서 하는 배정·제출은 실제 학생 화면에 전혀 반영되지 않습니다.</span>
        <Link to={`/teacher/${pin}`} className="rounded-md bg-white/10 px-2.5 py-1 hover:bg-white/20">
          미리보기 종료
        </Link>
      </div>

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">지도를 훔친 자들</p>
          <p className="truncate text-base font-black text-gray-900">{roundMeta.name}</p>
          <p className="truncate text-xs font-bold text-gray-500">{roundMeta.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <CountdownDisplay timer={timer} size="sm" />
          <SeatPreview seats={seats} />
          {isLocked ? (
            <span className="rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-black text-emerald-700">
              제출 완료 · 대기 중
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSubmitAttempt}
              className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-black text-white hover:bg-gray-700"
            >
              제출하기
            </button>
          )}
        </div>
      </header>

      {!isLocked && (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5 lg:hidden">
          <div className="min-w-0 flex-1">
            <DistrictPicker
              districts={DISTRICTS}
              districtColors={DISTRICT_THEME}
              activeDistrictId={activeDistrictId}
              onSelect={setActiveDistrictId}
              results={results}
            />
          </div>
          <ArmedButton
            label="전체 초기화"
            armedLabel="정말 초기화?"
            onConfirm={handleResetAll}
            className="shrink-0 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-black text-gray-600 hover:bg-gray-100"
            armedClassName="shrink-0 whitespace-nowrap rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-black text-red-700"
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col">
          <main className="relative min-h-0 flex-1 px-3 pb-2 pt-2">
            <MapCanvas
              key={currentRound}
              assignments={assignments}
              districtColors={DISTRICT_THEME}
              onAreaTap={handleAreaTap}
              readOnly={isLocked}
            />

            {toast && (
              <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2 text-center text-sm font-extrabold text-white shadow-lg">
                {toast}
              </div>
            )}
          </main>
        </div>

        <DistrictSidePanel
          districtColors={DISTRICT_THEME}
          results={results}
          unassignedCount={totalUnassigned}
          activeDistrictId={isLocked ? null : activeDistrictId}
          onSelectDistrict={isLocked ? undefined : setActiveDistrictId}
          onResetAll={isLocked ? undefined : handleResetAll}
        />
      </div>

      <DetailDrawer districtColors={DISTRICT_THEME} results={results} unassignedCount={totalUnassigned} />

      {validationResult && (
        <SubmitFeedback
          result={validationResult}
          round={currentRound}
          onClose={() => setValidationResult(null)}
          onConfirmSubmit={handleConfirmSubmit}
        />
      )}

      {onboardingStep === "why" && <IntroModal onClose={() => setOnboardingStep("rules")} />}
      {onboardingStep === "rules" && <RulesModal onClose={() => setOnboardingStep(null)} />}
    </div>
  );
}

function CenteredMessage({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">{children}</div>;
}
