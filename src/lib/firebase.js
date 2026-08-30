import { initializeApp, getApps } from "firebase/app";
import { enableLogging, forceLongPolling, forceWebSockets, getDatabase, onValue, ref } from "firebase/database";

// 배포 환경 변수는 서비스가 지정한 전용 Firebase 연결이므로 로컬스토리지보다 우선한다.
// 환경 변수가 없는 로컬 개발에서는 교사가 브라우저에 붙여넣은 설정을 대체값으로 쓴다.
const FIREBASE_CONFIG_STORAGE_KEY = "gerrymanderingFirebaseConfig";

if (typeof window !== "undefined") {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("firebaseDebug")) enableLogging(true);

  // 평소에는 Firebase가 WebSocket을 우선 사용하고, 학교망에서 WebSocket이 막힐 때는
  // 장기 폴링으로 자동 복구하도록 둔다. 예전의 잘못된 설정 때문에 남은 실패 표시는
  // 지워서 정상 WebSocket을 다시 먼저 시도하게 한다. 아래 진단 파라미터는 두 전송 방식을
  // 각각 실제 브라우저에서 검증할 때만 사용한다.
  const forcedTransport = searchParams.get("firebaseTransport");
  if (forcedTransport === "longpoll") {
    forceLongPolling();
  } else if (forcedTransport === "websocket") {
    forceWebSockets();
  } else {
    try {
      window.localStorage.removeItem("firebase:previous_websocket_failure");
    } catch {
      // 저장소 접근이 차단된 브라우저에서도 Firebase 기본 전송 선택은 그대로 동작한다.
    }
  }
}

function normalizeFirebaseConfig(config) {
  if (!config || typeof config !== "object") return {};
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
  );
}

function readStoredConfig() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config) {
  window.localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(normalizeFirebaseConfig(config)));
}

export function resolveFirebaseConfig(env = {}, stored = null) {
  const envConfig = normalizeFirebaseConfig({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  if (envConfig.apiKey && envConfig.databaseURL && envConfig.projectId) return envConfig;

  const storedConfig = normalizeFirebaseConfig(stored);
  if (storedConfig.apiKey && storedConfig.databaseURL && storedConfig.projectId) return storedConfig;

  return envConfig;
}

export function getFirebaseConfig() {
  return resolveFirebaseConfig(import.meta.env || {}, readStoredConfig());
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.databaseURL && config.projectId);
}

let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase 설정이 없습니다. 교사 설정에서 Firebase 설정을 붙여넣어 주세요.");
  }
  const app = getApps().length > 0 ? getApps()[0] : initializeApp(getFirebaseConfig());
  dbInstance = getDatabase(app);
  return dbInstance;
}

export function resetDbInstance() {
  // Firebase 설정이 바뀐 뒤(붙여넣기 직후) 새 설정으로 다시 초기화하기 위해 사용.
  dbInstance = null;
}

export const DATABASE_CONNECTION_TIMEOUT_MS = 10_000;

export function waitForDatabaseConnection(db = getDb(), timeoutMs = DATABASE_CONNECTION_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const connectionRef = ref(db, ".info/connected");
    let unsubscribe = null;
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      unsubscribe?.();
      callback(value);
    };

    const timeoutId = setTimeout(() => {
      finish(
        reject,
        new Error("실시간 서버에 연결하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요."),
      );
    }, timeoutMs);

    unsubscribe = onValue(
      connectionRef,
      (snapshot) => {
        if (snapshot.val() === true) finish(resolve);
      },
      (error) => finish(reject, error),
    );
  });
}
