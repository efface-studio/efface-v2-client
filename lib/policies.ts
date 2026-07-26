/**
 * Policy page content. Kept out of `messages/*.json` on purpose — it's long-form
 * prose, not UI copy, and the JSON files are already sizeable.
 *
 * These are drafts; the page says so explicitly. Legal review is still needed.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; heading: string; text: string }
  | { kind: "pairs"; pairs: [string, string][] };

export type PolicySection = {
  id: string;
  num: string;
  kicker: string;
  title: string;
  date: string;
  blocks: Block[];
};

export type PolicyContent = {
  navLabel: string;
  pageTitle: string;
  pageLead: string;
  home: string;
  sections: PolicySection[];
};

const KO: PolicyContent = {
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

const EN: PolicyContent = {
  navLabel: "INDEX",
  pageTitle: "Policies & Terms",
  pageLead:
    "The standards efface holds itself to. These documents are drafts and may be revised as the service evolves.",
  home: "← Back home",
  sections: [
    {
      id: "privacy",
      num: "01",
      kicker: "PRIVACY",
      title: "Privacy Policy",
      date: "Effective 26 Jul 2026",
      blocks: [
        {
          kind: "p",
          text: "efface (“the Company”) treats your personal information with care and complies with the Personal Information Protection Act and other applicable Korean law.",
        },
        {
          kind: "h",
          heading: "1. What we collect",
          text: "When you contact us: your email address and the content of your enquiry. Access logs, cookies and device information may be collected automatically as you use the service.",
        },
        {
          kind: "h",
          heading: "2. Why we collect it",
          text: "To respond to enquiries, to provide and improve the service, and to analyse usage statistics.",
        },
        {
          kind: "h",
          heading: "3. How long we keep it",
          text: "Up to one year after your enquiry is resolved, then destroyed without delay. Where the law requires retention, we keep it for that period.",
        },
        {
          kind: "h",
          heading: "4. Third parties and processors",
          text: "We do not provide your personal information to third parties. Storage may be entrusted to cloud hosting providers (Vercel, AWS and similar) to operate the service.",
        },
        {
          kind: "h",
          heading: "5. Your rights",
          text: "You may request access to, correction of, deletion of, or suspension of processing of your personal information at any time.",
        },
        {
          kind: "h",
          heading: "6. Data protection officer",
          text: "Seojiwan Suh · xixn2@efface.dev",
        },
      ],
    },
    {
      id: "terms",
      num: "02",
      kicker: "TERMS",
      title: "Terms of Service",
      date: "Effective 26 Jul 2026",
      blocks: [
        {
          kind: "h",
          heading: "Article 1 (Purpose)",
          text: "These terms set out the conditions and procedures for using the websites and applications provided by efface (“the Company”), along with the rights and obligations of the Company and its users.",
        },
        {
          kind: "h",
          heading: "Article 2 (Effect and amendment)",
          text: "These terms take effect once posted within the service. The Company may amend them within the bounds of applicable law, giving prior notice of the effective date and the reason for the change.",
        },
        {
          kind: "h",
          heading: "Article 3 (Provision and changes)",
          text: "The Company works to provide a stable service and may change all or part of it where operationally or technically necessary.",
        },
        {
          kind: "h",
          heading: "Article 4 (User obligations)",
          text: "Users must comply with applicable law and these terms, and must not interfere with the normal operation of the service.",
        },
        {
          kind: "h",
          heading: "Article 5 (Intellectual property)",
          text: "Copyright and intellectual property rights relating to the service belong to the Company.",
        },
        {
          kind: "h",
          heading: "Article 6 (Limitation of liability)",
          text: "The Company is not liable for damage arising from causes beyond its reasonable control, such as natural disasters or force majeure.",
        },
        {
          kind: "h",
          heading: "Article 7 (Governing law and jurisdiction)",
          text: "These terms are interpreted under the laws of the Republic of Korea. Disputes are brought before the court with jurisdiction under the Civil Procedure Act.",
        },
      ],
    },
    {
      id: "oss",
      num: "03",
      kicker: "OPEN SOURCE",
      title: "Open Source Licenses",
      date: "Last updated 26 Jul 2026",
      blocks: [
        {
          kind: "p",
          text: "efface's website and apps are built with open source software, including the projects below. Thanks to everyone who made these tools.",
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
          text: "The full list of open source used in each app, with license texts, is available in that app's settings screen.",
        },
      ],
    },
    {
      id: "cookies",
      num: "04",
      kicker: "COOKIES",
      title: "Cookie Policy",
      date: "Effective 26 Jul 2026",
      blocks: [
        {
          kind: "p",
          text: "Cookies are small text files a website stores in your browser. efface uses them for the following purposes.",
        },
        {
          kind: "h",
          heading: "Essential cookies",
          text: "Used to keep basic site functions working (theme, language preference). These cannot be disabled.",
        },
        {
          kind: "h",
          heading: "Analytics cookies",
          text: "Used to understand visit statistics. The information collected is processed in a form that does not identify individuals.",
        },
        {
          kind: "h",
          heading: "Managing cookies",
          text: "You can refuse or delete cookies in your browser settings. Blocking essential cookies may stop some features from working correctly.",
        },
      ],
    },
    {
      id: "no-email-collection",
      num: "05",
      kicker: "EMAIL",
      title: "No Email Collection",
      date: "Effective 26 Jul 2026",
      blocks: [
        {
          kind: "p",
          text: "We refuse the unauthorised collection of email addresses posted on this website by email-harvesting programs or other technical means. Violations may be subject to criminal penalties under Article 50-2 of the Act on Promotion of Information and Communications Network Utilisation and Information Protection.",
        },
      ],
    },
    {
      id: "security",
      num: "06",
      kicker: "SECURITY",
      title: "Report a Vulnerability",
      date: "Last updated 26 Jul 2026",
      blocks: [
        {
          kind: "p",
          text: "If you find a security vulnerability in an efface website or app, please report it to support@efface.dev. Including reproduction steps and the scope of impact helps us confirm it quickly.",
        },
        {
          kind: "h",
          heading: "How we handle it",
          text: "Acknowledgement within one business day → impact analysis and fix → we report back on what was done. Thank you to everyone who practices responsible disclosure.",
        },
        {
          kind: "h",
          heading: "What we ask",
          text: "Please avoid accessing or exfiltrating data beyond what is needed to confirm the issue, and avoid testing that would disrupt the service.",
        },
      ],
    },
    {
      id: "copyright",
      num: "07",
      kicker: "COPYRIGHT",
      title: "Copyright Notice",
      date: "Effective 26 Jul 2026",
      blocks: [
        {
          kind: "p",
          text: "Copyright in all content of this website and the apps efface has built (GOMS, HiNest, Muru, QTO) — design, logos, text, images — belongs to efface.",
        },
        {
          kind: "p",
          text: "Content may not be reproduced, distributed, transmitted or used to create derivative works without prior written consent. When quoting, please credit the source (efface.dev).",
        },
      ],
    },
    {
      id: "user-rights",
      num: "08",
      kicker: "USER RIGHTS",
      title: "User Rights & Notices",
      date: "Effective 26 Jul 2026",
      blocks: [
        {
          kind: "h",
          heading: "Your rights",
          text: "You may request access to, correction of, deletion of, or suspension of processing of your personal information. Send requests to contact@efface.dev and we will act without delay.",
        },
        {
          kind: "h",
          heading: "Notices",
          text: "Information published in the service is for reference and may change without prior notice. We are not responsible for the content of sites reached through external links.",
        },
        {
          kind: "h",
          heading: "Questions",
          text: "For questions about these policies, write to contact@efface.dev.",
        },
      ],
    },
  ],
};

export function getPolicies(locale: string): PolicyContent {
  return locale === "ko" ? KO : EN;
}
