# efface — v2 client

efface의 공식 사이트(v2). **복잡함은 지우고, 효과만 남깁니다.**
AI · 웹 · 앱을 만드는 개발 스튜디오 소개 사이트입니다. 한국어 / 영어를 지원하며,
다크 테마 · 배경 영상 히어로 · 스크롤 기반 모션으로 구성된 단일 페이지입니다.

## 스택

- **Next.js 16** (App Router, Turbopack)
- **React 19** / **TypeScript**
- **Tailwind CSS v4**
- **next-intl** — 로케일 라우팅(ko/en)
- **motion** — 스크롤 패럴럭스 · pinned 가로 스크롤

## 명령어

```bash
npm run dev        # 개발 서버 (http://localhost:3100)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버
npm run typecheck  # tsc --noEmit
```

## 구조

```
app/
  layout.tsx            # 패스스루 루트 레이아웃
  [locale]/
    layout.tsx          # <html>/<body>, 폰트, 메타데이터, Nav
    page.tsx            # 홈 (Hero → Services → Approach → Contact → Footer)
components/
  Nav.tsx               # 상단 바 · 햄버거 오버레이 메뉴
  LanguageToggle.tsx    # KO / EN 전환
  Reveal.tsx            # 스크롤 인 애니메이션 래퍼
  sections/
    Hero.tsx            # 배경 영상 + 패럴럭스
    ServiceScroll.tsx   # pinned 가로 스크롤 (데스크탑) / 스택 (모바일)
    Approach.tsx        # 원칙 + 스택 마퀴
    Contact.tsx         # 이메일 CTA
i18n/                   # next-intl 라우팅/요청 설정
messages/               # ko.json / en.json
public/hero.mp4         # 로고 애니메이션 배경 영상
```

## 컨벤션

이 저장소의 모든 작업은 [`CLAUDE.md`](./CLAUDE.md)의 규칙(이슈 → 브랜치 → PR,
커밋 컨벤션, 라벨, CI)을 따릅니다.
