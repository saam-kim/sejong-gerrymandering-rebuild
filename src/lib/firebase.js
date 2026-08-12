import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// 교사가 GitHub Pages 등 무서버 배포 환경에서도 쓸 수 있도록,
// 브라우저에 직접 붙여넣은 설정(로컬스토리지)을 .env 기본값보다 우선한다.
const FIREBASE_CONFIG_STORAGE_KEY = "gerrymanderingFirebaseConfig";

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
  window.localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function getFirebaseConfig() {
  const stored = readStoredConfig();
  if (stored?.apiKey && stored?.databaseURL && stored?.projectId) return stored;

  const env = import.meta.env || {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
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
