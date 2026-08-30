import { describe, expect, it } from "vitest";
import { resolveFirebaseConfig } from "./firebase";

const stored = {
  apiKey: "old-browser-key",
  databaseURL: "https://old-project.firebaseio.com",
  projectId: "old-project",
};

describe("resolveFirebaseConfig", () => {
  it("prefers a complete deployment config over a stored browser config", () => {
    const config = resolveFirebaseConfig(
      {
        VITE_FIREBASE_API_KEY: "deployment-key",
        VITE_FIREBASE_AUTH_DOMAIN: "new-project.firebaseapp.com",
        VITE_FIREBASE_DATABASE_URL: "https://new-project.firebasedatabase.app",
        VITE_FIREBASE_PROJECT_ID: "new-project",
        VITE_FIREBASE_STORAGE_BUCKET: "new-project.firebasestorage.app",
        VITE_FIREBASE_MESSAGING_SENDER_ID: "123",
        VITE_FIREBASE_APP_ID: "1:123:web:abc",
      },
      stored,
    );

    expect(config.projectId).toBe("new-project");
    expect(config.apiKey).toBe("deployment-key");
  });

  it("uses browser config only when deployment config is incomplete", () => {
    expect(resolveFirebaseConfig({}, stored)).toEqual(stored);
  });

  it("trims whitespace accidentally included in deployment environment variables", () => {
    const config = resolveFirebaseConfig({
      VITE_FIREBASE_API_KEY: "  deployment-key \n",
      VITE_FIREBASE_AUTH_DOMAIN: " new-project.firebaseapp.com ",
      VITE_FIREBASE_DATABASE_URL: "https://new-project.firebasedatabase.app ",
      VITE_FIREBASE_PROJECT_ID: " new-project ",
      VITE_FIREBASE_STORAGE_BUCKET: " new-project.firebasestorage.app ",
      VITE_FIREBASE_MESSAGING_SENDER_ID: " 123 ",
      VITE_FIREBASE_APP_ID: " 1:123:web:abc ",
    });

    expect(config).toEqual({
      apiKey: "deployment-key",
      authDomain: "new-project.firebaseapp.com",
      databaseURL: "https://new-project.firebasedatabase.app",
      projectId: "new-project",
      storageBucket: "new-project.firebasestorage.app",
      messagingSenderId: "123",
      appId: "1:123:web:abc",
    });
  });

  it("trims a browser-stored fallback and ignores whitespace-only deployment values", () => {
    expect(
      resolveFirebaseConfig(
        {
          VITE_FIREBASE_API_KEY: " ",
          VITE_FIREBASE_DATABASE_URL: "\n",
          VITE_FIREBASE_PROJECT_ID: "\t",
        },
        {
          apiKey: " old-browser-key ",
          databaseURL: " https://old-project.firebaseio.com ",
          projectId: " old-project ",
        },
      ),
    ).toEqual(stored);
  });
});
