import { initializeApp, getApps } from "firebase/app";
import { enableLogging, forceWebSockets, getDatabase } from "firebase/database";

// 배포 환경 변수는 서비스가 지정한 전용 Firebase 연결이므로 로컬스토리지보다 우선한다.
// 환경 변수가 없는 로컬 개발에서는 교사가 브라우저에 붙여넣은 설정을 대체값으로 쓴다.
const FIREBASE_CONFIG_STORAGE_KEY = "gerrymanderingFirebaseConfig";

if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("firebaseDebug")) {
  enableLogging(true);
}

// 잘못된 배포 설정으로 연결이 실패했던 브라우저는 장기 폴링만 고집하는 실패 이력을
// 저장한다. 정상 설정이 배포된 뒤에도 그 상태가 남아 있으므로 검증된 WebSocket을 사용한다.
if (typeof window !== "undefined") forceWebSockets();

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
