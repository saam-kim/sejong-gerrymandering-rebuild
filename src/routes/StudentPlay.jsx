import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { useTeamSession } from "../hooks/useTeamSession";
import { useAutosave } from "../hooks/useAutosave";
import { getRoundMeta } from "../lib/rounds";
import { submitPlan } from "../lib/planActions";
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
import MiniMap from "../components/map/MiniMap";
import DistrictPicker from "../components/panels/DistrictPicker";
import DetailDrawer from "../components/panels/DetailDrawer";
import DistrictSidePanel from "../components/panels/DistrictSidePanel";
import SubmitFeedback from "../components/panels/SubmitFeedback";
import SeatPreview from "../components/panels/SeatPreview";
import CountdownDisplay from "../components/CountdownDisplay";
import IntroModal from "../components/panels/IntroModal";
import RulesModal from "../components/panels/RulesModal";
import ArmedButton from "../components/ArmedButton";

function introSeenKey(pin, teamId) {
  return `gerrymandering_intro_seen:${pin}:${teamId}`;
}

export default function StudentPlay() {
  const { pin } = useParams();
  const session = useTeamSession(pin);
  const { meta, drafts, submissions, timer, loading, exists } = useRoom(pin);
  // 학생이 처음 입장했을 때만 순서대로 보여주는 온보딩: "왜 하는지" → "규칙" → 시작
  const [onboardingStep, setOnboardingStep] = useState(() =>
    session.teamId && !window.localStorage.getItem(introSeenKey(pin, session.teamId)) ? "why" : null,
  );

  const currentRound = meta?.currentRound || 1;
  const roundMeta = getRoundMeta(currentRound);

  const mySubmission = submissions?.[currentRound]?.[session.teamId];
  const myDraft = drafts?.[currentRound]?.[session.teamId];
  const isLocked = Boolean(mySubmission);

  const [assignments, setAssignments] = useState(
    () => mySubmission?.assignments || myDraft?.assignments || getEmptyAssignments(),
  );
  const [activeDistrictId, setActiveDistrictId] = useState(DISTRICTS[0]);
  const [transform, setTransform] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const hasHydratedRoundRef = useRef(false);

  function showToast(text) {
    setToast(text);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2400);
  }

  // 라운드가 바뀌면(교사가 다음 라운드로 넘기면) 배정을 새 라운드 기준으로 다시 초기화한다.
  // Firebase 데이터는 비동기로 도착하므로 loading도 의존성에 넣어 로딩이 막 끝난 시점에도
  // 한 번 더 복원한다 — 그래야 새로고침/재접속 시 저장돼 있던 배정(제출본 또는 자동저장
  // 초안)이 빈 지도로 보이는 일이 없다. hasHydratedRoundRef는 이 최초 복원 시점엔 안내
  // 토스트를 띄우지 않기 위한 가드(진짜 라운드 전환 때만 띄움).
  useEffect(() => {
    if (loading) return;
    setAssignments(mySubmission?.assignments || myDraft?.assignments || getEmptyAssignments());
    setActiveDistrictId(DISTRICTS[0]);
    setValidationResult(null);
    if (hasHydratedRoundRef.current) {
      showToast(`${roundMeta.name}이 시작되었습니다.`);
    }
    hasHydratedRoundRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, loading]);

  useAutosave({ pin, round: currentRound, teamId: session.teamId, assignments, isLocked });

  const results = useMemo(() => calculateDistrictResults(assignments), [assignments]);
  const seats = useMemo(() => calculateSeats(assignments), [assignments]);
  const totalUnassigned = useMemo(() => {
    const assignedIds = new Set(Object.entries(assignments).filter(([, v]) => v).map(([k]) => k));
    return Object.keys(getEmptyAssignments()).length - assignedIds.size;
  }, [assignments]);

  if (!session.teamId) {
    return <Navigate to="/join" replace />;
  }

  if (loading) {
    return <CenteredMessage>불러오는 중...</CenteredMessage>;
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

  function handleCloseIntro() {
    setOnboardingStep("rules");
  }

  function handleCloseRules() {
    window.localStorage.setItem(introSeenKey(pin, session.teamId), "true");
    setOnboardingStep(null);
  }

  function handleResetAll() {
    setAssignments(getEmptyAssignments());
    showToast("모든 배정을 초기화했습니다.");
  }

  function handleSubmitAttempt() {
    const result = validatePlan(assignments, { round: currentRound });
    setValidationResult(result);
  }

  async function handleConfirmSubmit() {
    setSubmitting(true);
    try {
      await submitPlan(pin, currentRound, session.teamId, assignments);
      setValidationResult(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">지도를 훔친 자들</p>
          <p className="truncate text-base font-black text-gray-900">{roundMeta.name}</p>
          <p className="truncate text-xs font-bold text-gray-500">{roundMeta.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <CountdownDisplay timer={timer} size="sm" />
          <SeatPreview seats={seats} />
          <div className="hidden h-16 w-24 sm:block">
            <MiniMap assignments={assignments} districtColors={DISTRICT_THEME} transform={transform} />
          </div>
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
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5">
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
          <div className="relative flex-1 sm:hidden">
            <div className="absolute right-3 top-3 z-10 h-20 w-20">
              <MiniMap assignments={assignments} districtColors={DISTRICT_THEME} transform={transform} />
            </div>
          </div>

          <main className="relative min-h-0 flex-1 px-3 pb-2 pt-2">
            <MapCanvas
              key={currentRound}
              assignments={assignments}
              districtColors={DISTRICT_THEME}
              onAreaTap={handleAreaTap}
              readOnly={isLocked}
              onViewportChange={setTransform}
            />

            {toast && (
              <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2 text-center text-sm font-extrabold text-white shadow-lg">
                {toast}
              </div>
            )}
          </main>
        </div>

        <DistrictSidePanel districtColors={DISTRICT_THEME} results={results} unassignedCount={totalUnassigned} />
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

      {onboardingStep === "why" && <IntroModal onClose={handleCloseIntro} />}
      {onboardingStep === "rules" && <RulesModal onClose={handleCloseRules} />}
    </div>
  );
}

function CenteredMessage({ children }) {
  return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">{children}</div>;
}
