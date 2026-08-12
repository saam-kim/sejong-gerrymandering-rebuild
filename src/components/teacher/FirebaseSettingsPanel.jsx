import { useState } from "react";
import { getFirebaseConfig, isFirebaseConfigured, resetDbInstance, saveFirebaseConfig } from "../../lib/firebase";

const CONFIG_KEYS = ["apiKey", "authDomain", "databaseURL", "projectId", "storageBucket", "messagingSenderId", "appId"];
const TEMPLATE = `const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};`;

function extractConfig(rawText) {
  return CONFIG_KEYS.reduce((config, key) => {
    const match = rawText.match(new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"']*)["']`));
    config[key] = match?.[1]?.trim() || "";
    return config;
  }, {});
}

export default function FirebaseSettingsPanel() {
  const [isOpen, setIsOpen] = useState(!isFirebaseConfigured());
  const [text, setText] = useState(() => {
    const config = getFirebaseConfig();
    return config.apiKey ? `const firebaseConfig = ${JSON.stringify(config, null, 2)};` : TEMPLATE;
  });
  const [message, setMessage] = useState("");

  function handleSave() {
    const config = extractConfig(text);
    if (!config.apiKey || !config.databaseURL || !config.projectId) {
      setMessage("apiKey, databaseURL, projectId가 포함된 설정 객체를 붙여넣어 주세요.");
      return;
    }
    saveFirebaseConfig(config);
    resetDbInstance();
    setMessage("저장했습니다. 페이지를 새로고침하면 적용됩니다.");
  }

  return (
    <div className="text-left text-sm">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between font-black text-white/80"
      >
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isFirebaseConfigured() ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          Firebase 연결 설정 {isFirebaseConfigured() ? "(설정됨)" : "(미설정 — 실시간 동기화가 안 됩니다)"}
        </span>
        <span className="text-white/40">{isOpen ? "접기" : "펼치기"}</span>
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs font-bold text-white/40">
            Firebase 콘솔의 Realtime Database 설정 객체를 그대로 붙여넣으세요. 브라우저에만 저장되며 서버로 전송되지 않습니다.
          </p>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={8}
            className="w-full rounded-lg border-2 border-white/15 bg-white/[0.08] p-2 font-mono text-xs text-white outline-none focus:border-indigo-400"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-500"
            >
              저장
            </button>
            {message && <span className="text-xs font-bold text-white/50">{message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
