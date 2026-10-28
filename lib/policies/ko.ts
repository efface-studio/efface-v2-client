import type { PolicyContent } from "./policies.types";

/** Korean policy documents. Drafts — the page says so explicitly. */
export const KO: PolicyContent = {
  navLabel: "INDEX",
  pageTitle: "정책 및 약관",
  pageLead:
    "efface가 서비스를 운영하며 지키는 기준입니다. 아래 문서는 초안이며, 실제 서비스 상황에 맞게 수정될 수 있습니다.",
  home: "← 홈으로",
  sections: [
    {
      id: "privacy",
      num: "01",
      kicker: "PRIVACY",
      title: "개인정보 처리방침",
      date: "시행일 2026. 07. 26",
      blocks: [
        {
          kind: "p",
          text: "efface(이하 “회사”)는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령을 준수합니다.",
        },
        {
          kind: "h",
          heading: "1. 수집하는 개인정보 항목",
          text: "문의 접수 시: 이메일 주소, 문의 내용. 서비스 이용 과정에서 접속 로그, 쿠키, 기기 정보가 자동으로 수집될 수 있습니다.",
        },
        {
          kind: "h",
          heading: "2. 수집 및 이용 목적",
          text: "문의 응대, 서비스 제공 및 개선, 서비스 이용 통계 분석.",
        },
        {
          kind: "h",
          heading: "3. 보유 및 이용 기간",
          text: "문의 처리 완료 후 1년까지 보관하며, 이후 지체 없이 파기합니다. 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.",
        },
        {
          kind: "h",
          heading: "4. 제3자 제공 및 처리위탁",
          text: "회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 서비스 운영을 위해 클라우드 호스팅(Vercel, AWS 등)에 보관을 위탁할 수 있습니다.",
        },
        {
          kind: "h",
          heading: "5. 이용자의 권리",
          text: "이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있습니다.",
        },
        {
          kind: "h",
          heading: "6. 개인정보 보호책임자",
          text: "성명: 서지완 · 이메일: xixn2@efface.dev",
        },
      ],
    },
    {
      id: "terms",
      num: "02",
      kicker: "TERMS",
      title: "서비스 이용약관",
      date: "시행일 2026. 07. 26",
      blocks: [
        {
          kind: "h",
          heading: "제1조 (목적)",
          text: "이 약관은 efface(이하 “회사”)가 제공하는 웹사이트 및 애플리케이션 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무를 규정함을 목적으로 합니다.",
        },
        {
          kind: "h",
          heading: "제2조 (약관의 효력 및 변경)",
          text: "이 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자와 사유를 명시하여 사전 공지합니다.",
        },
        {
          kind: "h",
          heading: "제3조 (서비스의 제공 및 변경)",
          text: "회사는 안정적인 서비스 제공을 위해 노력하며, 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있습니다.",
        },
        {
          kind: "h",
          heading: "제4조 (이용자의 의무)",
          text: "이용자는 관련 법령과 이 약관을 준수해야 하며, 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.",
        },
        {
          kind: "h",
          heading: "제5조 (지식재산권)",
          text: "서비스와 관련된 저작권 및 지식재산권은 회사에 귀속됩니다.",
        },
        {
          kind: "h",
          heading: "제6조 (면책)",
          text: "회사는 천재지변, 불가항력 등 회사의 합리적인 통제를 벗어난 사유로 발생한 손해에 대해 책임을 지지 않습니다.",
        },
        {
          kind: "h",
          heading: "제7조 (준거법 및 관할)",
          text: "이 약관은 대한민국 법령에 따라 해석되며, 분쟁 발생 시 민사소송법상의 관할 법원에 제소합니다.",
        },
      ],
    },
    {
      id: "oss",
      num: "03",
      kicker: "OPEN SOURCE",
      title: "오픈소스 라이선스",
      date: "최종 갱신 2026. 07. 26",
      blocks: [
        {
          kind: "p",
          text: "efface의 웹사이트와 앱은 아래를 포함한 오픈소스 소프트웨어로 만들어졌습니다. 훌륭한 도구를 만들어 주신 모든 기여자에게 감사드립니다.",
        },
        {
          kind: "pairs",
          pairs: [
            ["React", "MIT License"],
            ["Next.js", "MIT License"],
            ["TypeScript", "Apache-2.0"],
            ["Tailwind CSS", "MIT License"],
            ["three.js", "MIT License"],
            ["Pretendard", "SIL OFL 1.1"],
            ["JetBrains Mono", "SIL OFL 1.1"],
            ["Space Grotesk", "SIL OFL 1.1"],
          ],
        },
        {
          kind: "p",
          text: "각 앱에서 사용하는 전체 오픈소스 목록과 라이선스 전문은 해당 앱의 설정 화면에서 확인할 수 있습니다.",
        },
      ],
    },
    {
      id: "cookies",
      num: "04",
      kicker: "COOKIES",
      title: "쿠키 정책",
      date: "시행일 2026. 07. 26",
      blocks: [
        {
          kind: "p",
          text: "쿠키는 웹사이트가 이용자의 브라우저에 저장하는 작은 텍스트 파일입니다. efface는 다음 목적으로 쿠키를 사용합니다.",
        },
        {
          kind: "h",
          heading: "필수 쿠키",
          text: "사이트의 기본 기능(테마, 언어 설정 등) 유지에 사용되며, 비활성화할 수 없습니다.",
        },
        {
          kind: "h",
          heading: "분석 쿠키",
          text: "방문 통계 파악을 위해 사용됩니다. 수집된 정보는 개인을 식별하지 않는 형태로 처리됩니다.",
        },
        {
          kind: "h",
          heading: "쿠키 관리",
          text: "브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. 다만 필수 쿠키를 차단하면 일부 기능이 정상 동작하지 않을 수 있습니다.",
        },
      ],
    },
    {
      id: "no-email-collection",
      num: "05",
      kicker: "EMAIL",
      title: "이메일무단수집거부",
      date: "시행일 2026. 07. 26",
      blocks: [
        {
          kind: "p",
          text: "본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조의2에 의해 형사 처벌될 수 있음을 유념하시기 바랍니다.",
        },
      ],
    },
    {
      id: "security",
      num: "06",
      kicker: "SECURITY",
      title: "보안 취약점 신고",
      date: "최종 갱신 2026. 07. 26",
      blocks: [
        {
          kind: "p",
          text: "efface의 웹사이트 또는 앱에서 보안 취약점을 발견하셨다면 support@efface.dev로 제보해 주세요. 재현 방법과 영향 범위를 함께 보내주시면 빠르게 확인할 수 있습니다.",
        },
        {
          kind: "h",
          heading: "처리 절차",
          text: "접수 확인(1영업일) → 영향 분석 및 수정 → 조치 결과 회신. 책임 있는 공개(Responsible Disclosure)에 협조해 주신 제보자에게 감사드립니다.",
        },
        {
          kind: "h",
          heading: "부탁드리는 사항",
          text: "취약점 확인 목적을 넘는 데이터 접근·유출, 서비스 중단을 유발하는 테스트는 삼가 주세요.",
        },
      ],
    },
    {
      id: "copyright",
      num: "07",
      kicker: "COPYRIGHT",
      title: "저작권 안내",
      date: "시행일 2026. 07. 26",
      blocks: [
        {
          kind: "p",
          text: "본 웹사이트와 efface가 만든 앱(GOMS, HiNest, Muru, QTO)의 디자인, 로고, 텍스트, 이미지 등 모든 콘텐츠의 저작권은 efface에 귀속됩니다.",
        },
        {
          kind: "p",
          text: "사전 서면 동의 없이 콘텐츠를 복제, 배포, 전송, 2차적 저작물 작성 등에 이용할 수 없습니다. 인용 시에는 출처(efface.dev)를 명시해 주세요.",
        },
      ],
    },
    {
      id: "user-rights",
      num: "08",
      kicker: "USER RIGHTS",
      title: "이용자의 권리 및 유의사항",
      date: "시행일 2026. 07. 26",
      blocks: [
        {
          kind: "h",
          heading: "이용자의 권리",
          text: "이용자는 자신의 개인정보에 대해 열람·정정·삭제·처리정지를 요구할 수 있으며, 요청은 contact@efface.dev로 접수됩니다. 회사는 지체 없이 필요한 조치를 취합니다.",
        },
        {
          kind: "h",
          heading: "유의사항",
          text: "서비스에 게시된 정보는 참고용이며, 사전 고지 없이 변경될 수 있습니다. 외부 링크를 통해 연결되는 사이트의 콘텐츠에 대해서는 회사가 책임지지 않습니다.",
        },
        {
          kind: "h",
          heading: "문의",
          text: "본 정책에 대한 문의는 contact@efface.dev로 보내주세요.",
        },
      ],
    },
  ],
};
