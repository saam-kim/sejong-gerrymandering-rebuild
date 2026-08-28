import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 개인정보처리방침 정적 페이지를 확장자 없는 /privacy 경로에도 그대로 복제한다.
// public/privacy.html이 유일한 원본이며, 여기서는 빌드 결과물을 바이트 그대로
// 복사만 한다(내용을 두 곳에 손으로 유지하면서 서로 어긋날 위험을 없애기 위함).
// 이렇게 하는 이유: 외부 개인정보 스캐너(dorms-check 등)가 홈페이지 HTML의
// <a> 링크(SPA라 JS 실행 전 원본 HTML에는 없음) 또는 "/privacy"(확장자 없음)
// 경로를 확인하는데, 확장자 없는 경로는 기본적으로 존재하지 않기 때문.
function duplicatePrivacyPage() {
  return {
    name: 'duplicate-privacy-page',
    closeBundle() {
      copyFileSync(resolve(__dirname, 'dist/privacy.html'), resolve(__dirname, 'dist/privacy'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), duplicatePrivacyPage()],
  server: {
    host: '0.0.0.0',
  },
})
