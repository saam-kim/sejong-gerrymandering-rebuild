import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, ref } from "firebase/database";
import { getDb } from "../lib/firebase";
import { roomPath } from "../lib/roomPaths";
import { readTeamSession, useTeamSession } from "../hooks/useTeamSession";
import PinDigitRow from "../components/PinDigitRow";

export default function StudentJoin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const session = useTeamSession(pin.trim());

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanPin = pin.trim();
    const cleanName = teamName.trim();
    if (!cleanPin) {
      setError("선생님이 알려준 PIN을 입력해 주세요.");
      return;
    }
    if (!cleanName) {
      setError("모둠 이름을 입력해 주세요.");
      return;
    }

    setJoining(true);
    try {
      const db = getDb();
      const snapshot = await get(ref(db, roomPath(cleanPin)));
      if (!snapshot.exists()) {
        setError("해당 PIN의 방을 찾을 수 없습니다. PIN을 다시 확인해 주세요.");
        setJoining(false);
        return;
      }

      // 이 기기로 같은 PIN에 이미 참가한 적이 있다면(새로고침, 브라우저 재시작 등으로
      // 다시 참가 화면에 온 경우) 새 모둠을 또 만들지 않고 하던 모둠으로 바로 이어간다.
      const existing = readTeamSession(cleanPin);
      if (existing?.teamId) {
        navigate(`/play/${cleanPin}`);
        return;
      }

      await session.join(cleanName);
      navigate(`/play/${cleanPin}`);
    } catch (err) {
      setError(err.message || "참가하지 못했습니다. 다시 시도해 주세요.");
      setJoining(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a] px-5 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(79,70,229,0.28),transparent_70%)]" />

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-[420px]">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-300">지도를 훔친 자들</p>
          <h1 className="mt-2 text-2xl font-black text-indigo-100">모둠으로 참여하기</h1>
          <p className="mt-2 text-sm font-bold text-white/40">선생님이 알려준 PIN을 입력하세요</p>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur">
          <label className="block">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.08em] text-white/50">수업 PIN 6자리</span>
            <PinDigitRow value={pin} length={6} onChange={setPin} name="join-pin" autoFocus />
          </label>

          <div className="my-6 h-px bg-white/[0.08]" />

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-white/50">모둠 이름</span>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="예: 1모둠"
              maxLength={30}
              className="h-[52px] w-full rounded-xl border-2 border-white/15 bg-white/[0.08] px-4 text-base font-extrabold text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400"
            />
          </label>

          {error && <p className="mt-4 text-sm font-black text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={joining}
            className="mt-6 flex h-[54px] w-full items-center justify-center rounded-[14px] bg-indigo-600 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
          >
            {joining ? "참가하는 중..." : "입장하기"}
          </button>
        </div>

        <p className="mt-5 text-center text-xs font-bold leading-6 text-white/30">
          같은 모둠은 모두 같은 이름으로 입력해야 같은 모둠으로 묶입니다.
        </p>
      </form>
    </main>
  );
}
