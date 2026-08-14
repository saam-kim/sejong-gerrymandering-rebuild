import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "2026-08-14";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-gray-900">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-xs font-black text-indigo-600 hover:underline">
          ← 처음으로
        </Link>
        <h1 className="mt-4 text-2xl font-black">지도를 훔친 자들 — 개인정보처리방침</h1>
        <p className="mt-2 text-sm font-bold text-gray-500">시행일: {EFFECTIVE_DATE}</p>

        <p className="mt-6 text-sm leading-7 text-gray-700">
          "지도를 훔친 자들"(이하 "서비스")은 「개인정보 보호법」 제30조에 따라 정보주체의
          개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 다음과 같이 개인정보처리방침을
          수립·공개합니다.
        </p>

        <Section title="제1조 (총칙 및 데이터 처리 구조)">
          <p>
            서비스는 고등학교 사회·정치 수업용 게리맨더링 시뮬레이션입니다. 별도의 회원가입이나
            로그인 없이, 교사가 발급한 6자리 참가 PIN만으로 접속합니다. 학생이 실명·이메일 등
            개인 식별 정보를 직접 입력하는 항목은 없습니다 — 모둠 이름은 학생이 자유롭게
            입력하지 않고, <b>서버가 입장 순서에 따라 자동으로 "1모둠", "2모둠"과 같이
            부여합니다(가명처리)</b>.
          </p>
        </Section>

        <Section title="제2조 (처리하는 개인정보 항목)">
          <p>서비스가 실제로 저장하는 정보는 다음과 같이 최소화되어 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>모둠 정보: 자동 부여된 모둠 이름(예: "1모둠"), 입장 시각</li>
            <li>활동 기록: 선거구 배정 선택 내역(어느 읍·면·동을 어느 선거구에 배정했는지), 제출 시각</li>
          </ul>
          <p className="mt-2">
            주민등록번호, 실명, 이메일, 생년월일, 연락처 등은 수집하지 않습니다. 접속 시
            네트워크 계층에서 자연히 발생하는 정보(예: IP 주소)는 인프라 제공자(Firebase,
            GitHub Pages)가 자체 운영 목적으로만 처리할 뿐, 서비스가 별도로 수집·저장하지
            않습니다.
          </p>
        </Section>

        <Section title="제3조 (개인정보의 처리 목적)">
          <p>
            위 정보는 모둠별 활동 진행 상황을 교사 화면에 실시간으로 보여주고, 모둠 간 결과를
            비교·전체화면으로 공유하기 위한 목적으로만 처리합니다. 그 외의 목적으로는
            이용하지 않습니다.
          </p>
        </Section>

        <Section title="제4조 (처리 및 보유 기간)">
          <p>
            서비스는 현재 자동 삭제 기능을 제공하지 않습니다. 모둠 데이터는 교사가 대시보드의
            모둠 삭제 기능을 사용하거나 Firebase 콘솔에서 직접 삭제하기 전까지 보관됩니다.
            수업 종료 후 신속한 삭제를 권장하며, 향후 자동 파기 기능 도입을 검토하고 있습니다.
          </p>
        </Section>

        <Section title="제5조 (개인정보의 제3자 제공)">
          <p>서비스는 정보주체의 개인정보를 제3자에게 제공하지 않습니다.</p>
        </Section>

        <Section title="제6조 (개인정보 처리의 위탁)">
          <p>서비스는 원활한 운영을 위해 다음과 같이 처리를 위탁하고 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <b>Google LLC (Firebase Realtime Database)</b> — 위탁 업무: 데이터베이스 호스팅·저장.
              처리 위치: 싱가포르(asia-southeast1 리전). 국외 이전에 해당하며, Firebase의
              자체 보안·컴플라이언스 체계에 따라 관리됩니다.
            </li>
            <li>
              <b>GitHub, Inc. (GitHub Pages)</b> — 위탁 업무: 웹사이트 정적 파일 호스팅.
            </li>
          </ul>
        </Section>

        <Section title="제7조 (정보주체의 권리·의무 및 행사 방법)">
          <p>
            정보주체(교사·학생)는 언제든지 자신의 정보에 대한 열람·정정·삭제·처리정지를
            요구할 수 있습니다. 요청은 아래 연락처로 하실 수 있으며, 법령에 따라 지체 없이
            (10일 이내) 조치합니다.
          </p>
          <p className="mt-2 font-bold text-amber-700">
            [연락처 미기재 — 운영자 확인 후 채워질 예정입니다]
          </p>
        </Section>

        <Section title="제8조 (만 14세 미만 아동의 개인정보)">
          <p>
            서비스는 고등학교 수업을 대상으로 설계되어, 이용자는 통상 만 14세 이상입니다.
            다만 만일의 경우를 대비해 다음 구조를 유지합니다: 학생에게 실명 등 식별정보를
            애초에 입력받지 않으며, 모둠 이름은 서버가 자동 부여하는 순번(가명)만 사용합니다.
          </p>
        </Section>

        <Section title="제9조 (개인정보의 안전성 확보 조치)">
          <p>서비스는 다음과 같은 안전조치를 취하고 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>전송 구간 암호화: 모든 통신은 HTTPS로 암호화됩니다(GitHub Pages, Firebase 모두 HTTPS 강제).</li>
            <li>
              데이터 형식 검증: Firebase 보안 규칙에서 저장 가능한 데이터의 형식·범위를
              엄격히 제한해, 정의되지 않은 필드나 범위를 벗어난 값의 저장을 서버 단에서
              거부합니다.
            </li>
          </ul>
          <p className="mt-2">
            다만 참가 PIN 외의 별도 로그인·인증 체계는 두지 않았습니다. PIN(6자리)을 아는
            사람은 해당 수업 방의 정보를 읽고 쓸 수 있어, 완전한 접근통제 수준은 아님을
            투명하게 밝힙니다 — 민감하지 않은 학급 활동 데이터라는 점을 감안한 설계입니다.
          </p>
        </Section>

        <Section title="제10조 (개인정보 보호책임자)">
          <p className="font-bold text-amber-700">
            [보호책임자 이름·직책·연락처 미기재 — 운영자 확인 후 채워질 예정입니다]
          </p>
          <p className="mt-2">
            정보주체는 개인정보 침해에 대해 개인정보분쟁조정위원회(1833-6972),
            개인정보침해신고센터(118) 등에도 상담·신고할 수 있습니다.
          </p>
        </Section>

        <Section title="제11조 (처리방침의 변경)">
          <p>
            이 방침은 {EFFECTIVE_DATE}부터 적용되며, 내용 변경 시 시행 7일 전부터 이 페이지를
            통해 공지합니다.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-black text-gray-900">{title}</h2>
      <div className="mt-2 text-sm leading-7 text-gray-700">{children}</div>
    </section>
  );
}
