import type { PolicyContent } from "./policies.types";

/** English policy documents. Drafts — the page says so explicitly. */
export const EN: PolicyContent = {
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
          text: "Copyright in all content of this website and the apps efface has built (HiNest, Muru, QTO) — design, logos, text, images — belongs to efface.",
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
