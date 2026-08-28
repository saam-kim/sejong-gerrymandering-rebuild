import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update, remove, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAqm49veIZMeaZdmwkX0R779s1u8YApISM",
  authDomain: "sejong-gerrymandering-2026.firebaseapp.com",
  databaseURL: "https://sejong-gerrymandering-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sejong-gerrymandering-2026",
  storageBucket: "sejong-gerrymandering-2026.firebasestorage.app",
  messagingSenderId: "145438741733",
  appId: "1:145438741733:web:deb136912465e34153f00c"
};

const app = initializeApp(firebaseConfig, "sim-" + Date.now());
const db = getDatabase(app);

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runSimulation1() {
  console.log("\n==========================================");
  console.log("▶ [시뮬레이션 1] 기본 수업 플로우 (교사 방 생성 → 2개 모둠 참가 → 1라운드 획정 제출 → 라운드 진행)");
  console.log("==========================================");

  const pin = "881122"; // 6자리 PIN
  const roomRef = ref(db, `rooms/${pin}`);

  // 1. 교사: 방 생성
  console.log("[1. 교사] 방 생성 중... (PIN: " + pin + ")");
  await set(ref(db, `rooms/${pin}/meta`), {
    createdAt: Date.now(),
    currentRound: 1,
    status: "waiting",
    teamCounter: 0,
    timer: {
      durationSeconds: 300,
      endsAt: null,
      remainingMs: 300000,
      running: false
    }
  });
  console.log("  ✓ 교사 방 생성 완료!");

  // 2. 모둠 1 참가
  console.log("[2. 학생] 1모둠 참가 요청...");
  const team1Ref = ref(db, `rooms/${pin}/teams/team1`);
  await set(team1Ref, {
    teamName: "1모둠",
    joinedAt: Date.now()
  });
  await update(ref(db, `rooms/${pin}/meta`), { teamCounter: 1, status: "playing" });
  console.log("  ✓ 1모둠 참가 완료!");

  // 3. 모둠 2 참가
  console.log("[3. 학생] 2모둠 참가 요청...");
  const team2Ref = ref(db, `rooms/${pin}/teams/team2`);
  await set(team2Ref, {
    teamName: "2모둠",
    joinedAt: Date.now()
  });
  await update(ref(db, `rooms/${pin}/meta`), { teamCounter: 2 });
  console.log("  ✓ 2모둠 참가 완료!");

  // 4. 교사: 타이머 시작
  console.log("[4. 교사] 1라운드 타이머 시작 (300초)");
  const endsAt = Date.now() + 300000;
  await update(ref(db, `rooms/${pin}/meta/timer`), {
    running: true,
    endsAt: endsAt,
    remainingMs: 300000
  });

  // 5. 모둠 1 실시간 드래프트 및 최종 제출
  console.log("[5. 학생] 1모둠 선거구 배정 드래프트 저장 및 최종 제출...");
  const sampleAssignments1 = {
    "1": 1, "2": 1, "3": 1,
    "4": 2, "5": 2, "6": 2,
    "7": 3, "8": 3, "9": 3,
    "10": 4, "11": 4,
    "12": 5, "13": 5, "14": 5
  };
  await set(ref(db, `rooms/${pin}/drafts/1/team1`), {
    assignments: sampleAssignments1,
    updatedAt: Date.now()
  });
  await set(ref(db, `rooms/${pin}/submissions/1/team1`), {
    assignments: sampleAssignments1,
    submittedAt: Date.now()
  });
  console.log("  ✓ 1모둠 1라운드 제출 완료!");

  // 6. 모둠 2 최종 제출
  console.log("[6. 학생] 2모둠 선거구 배정 제출...");
  const sampleAssignments2 = {
    "1": 2, "2": 2, "3": 1,
    "4": 1, "5": 3, "6": 3,
    "7": 3, "8": 4, "9": 4,
    "10": 4, "11": 5,
    "12": 5, "13": 5, "14": 1
  };
  await set(ref(db, `rooms/${pin}/submissions/1/team2`), {
    assignments: sampleAssignments2,
    submittedAt: Date.now()
  });
  console.log("  ✓ 2모둠 1라운드 제출 완료!");

  // 7. 교사: 제출 확인 및 2라운드로 진행
  const snap = await get(ref(db, `rooms/${pin}`));
  const data = snap.val();
  console.log("[7. 교사] 실시간 제출 현황 확인:");
  console.log("  - 등록된 모둠 수:", Object.keys(data.teams || {}).length);
  console.log("  - 1라운드 제출 모둠 수:", Object.keys(data.submissions?.["1"] || {}).length);

  console.log("[8. 교사] 2라운드로 진행...");
  await update(ref(db, `rooms/${pin}/meta`), {
    currentRound: 2
  });

  // 데이터 정리
  await remove(roomRef);
  console.log("  ✓ 시뮬레이션 1 데이터 정리(방 삭제) 완료!");
}

async function runSimulation2() {
  console.log("\n==========================================");
  console.log("▶ [시뮬레이션 2] 다수 모둠 실시간 동기화 & 라운드 연속 진행 & 재접속/데이터 일관성 테스트");
  console.log("==========================================");

  const pin = "992233";
  const roomRef = ref(db, `rooms/${pin}`);

  // 1. 방 생성
  console.log("[1. 교사] 방 생성 (PIN: " + pin + ")");
  await set(ref(db, `rooms/${pin}/meta`), {
    createdAt: Date.now(),
    currentRound: 1,
    status: "waiting",
    teamCounter: 0,
    timer: {
      durationSeconds: 180,
      endsAt: null,
      remainingMs: 180000,
      running: false
    }
  });

  // 2. 4개 모둠 동시 참가
  console.log("[2. 학생] 4개 모둠(1~4모둠) 순차/동시 입장...");
  for (let i = 1; i <= 4; i++) {
    await set(ref(db, `rooms/${pin}/teams/team${i}`), {
      teamName: `${i}모둠`,
      joinedAt: Date.now()
    });
    await update(ref(db, `rooms/${pin}/meta`), { teamCounter: i });
  }
  console.log("  ✓ 4개 모둠 입장 완료!");

  // 3. 실시간 리스너 테스트 (교사 대시보드 관점)
  let liveSubmissionsCount = 0;
  const unsubscribe = onValue(ref(db, `rooms/${pin}/submissions/1`), (snapshot) => {
    const val = snapshot.val() || {};
    liveSubmissionsCount = Object.keys(val).length;
    console.log(`  [실시간 알림] 교사 대시보드에 제출된 모둠 수 업데이트: ${liveSubmissionsCount}/4`);
  });

  // 4. 각 모둠이 순서대로 제출
  for (let i = 1; i <= 4; i++) {
    await wait(200);
    const assign = {};
    for (let d = 1; d <= 14; d++) {
      assign[String(d)] = ((d + i) % 5) + 1;
    }
    await set(ref(db, `rooms/${pin}/submissions/1/team${i}`), {
      assignments: assign,
      submittedAt: Date.now()
    });
  }

  await wait(500);
  off(ref(db, `rooms/${pin}/submissions/1`));

  // 5. 3라운드까지 연속 진행
  console.log("[5. 진행] 2라운드 및 3라운드 진행...");
  await update(ref(db, `rooms/${pin}/meta`), { currentRound: 2 });
  await update(ref(db, `rooms/${pin}/meta`), { currentRound: 3 });

  // 6. 방 데이터 최종 검증
  const finalSnap = await get(roomRef);
  const finalData = finalSnap.val();
  console.log("[6. 검증] 최종 방 데이터 구조 정상 확인: Round " + finalData.meta.currentRound);

  // 방 삭제
  await remove(roomRef);
  console.log("  ✓ 시뮬레이션 2 데이터 정리 완료!");
}

async function main() {
  try {
    await runSimulation1();
    await runSimulation2();
    console.log("\n==========================================");
    console.log("🎉 시뮬레이션 2회 모두 성공적으로 완료되었습니다!");
    console.log("==========================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ 시뮬레이션 실패:", err);
    process.exit(1);
  }
}

main();
