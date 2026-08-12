# 지도를 훔친 자들: 세종시 게리맨더링 시뮬레이션

고등학교 사회/정치 수업용 웹앱입니다. 학생 모둠이 세종특별자치시 실제 읍·면·동을
5개 선거구로 재획정하며 게리맨더링을 체험합니다.

- 1라운드 · 기본 획정 — 인접 + 인구 60,000~110,000명 조건을 만족하는 5개 선거구 획정
- 2라운드 · 의석 뒤집기 — 같은 조건 안에서 한 정당이 5석 중 4석을 갖도록 설계
- 3라운드 · 공정성 회복 — 득표율과 의석 비율 차이를 최소화하는 지도로 재설계

## 데이터 출처

`src/data/sejongAreas.js` 상단 주석에 상세히 기록되어 있습니다. 요약:

- 인구: 행정안전부 주민등록인구통계, 2022년 5월 기준(2022.6.1 지방선거 직전)
- 득표: 중앙선거관리위원회 자료공간, 제8회 전국동시지방선거(2022.6.1) 세종특별자치시장
  선거 읍면동별 개표결과 원자료
- 경계: github.com/vuski/admdongkor 행정동 경계(ver20260701)를 기반으로, 2022년 당시
  아직 분리되지 않았던 나성동→새롬동, 어진동→도담동을 실제 폴리곤 union으로 병합

세종시 24개 읍·면·동 중 2022년 선거 당시 존재했던 22개 단위를 사용합니다.

## 실행

```bash
npm install
npm run dev
```

## 테스트

```bash
npm test
```

`src/lib/districtRules.js`의 인접성 판정, 인구 조건, 의석 계산 로직에 대한 단위 테스트입니다.

## 빌드

```bash
npm run build
```

## Firebase 설정

실시간 동기화(교사 대시보드 ↔ 학생 화면)를 쓰려면 Firebase Realtime Database 프로젝트가
필요합니다. 두 가지 방법 중 하나를 쓰세요.

1. **배포 환경 변수** — `.env.example`을 참고해 `VITE_FIREBASE_*` 값을 설정
2. **브라우저에서 직접 설정** — 교사 화면의 "Firebase 연결 설정" 패널에 Firebase 콘솔의
   설정 객체를 붙여넣으면 브라우저 로컬스토리지에 저장됩니다(서버 전송 없음). GitHub Pages
   같은 무서버 배포에서 유용합니다.

Realtime Database 규칙은 `firebase.database.rules.json` 참고(교실 한정 사용을 전제로
PIN 단위 read/write를 열어 둔 단순한 규칙입니다).

## 공유용 GitHub Pages

이 저장소를 GitHub에 올리고 저장소 Settings → Pages에서 소스를 "GitHub Actions"로 설정하면
`main` 브랜치에 push될 때 `.github/workflows/deploy.yml`이 자동으로 빌드·배포합니다. Firebase
설정은 저장소 Settings → Secrets에 `VITE_FIREBASE_*` 값을 등록해 두세요.

저장소를 `username.github.io/repo-이름` 형태(프로젝트 페이지)로 배포한다면
`vite.config.js`에 `base: "/repo-이름/"`을 추가해야 정적 자원 경로가 올바르게 잡힙니다.
라우팅은 해시 기반(`HashRouter`)이라 서버 설정 없이도 새로고침 시 깨지지 않습니다.
