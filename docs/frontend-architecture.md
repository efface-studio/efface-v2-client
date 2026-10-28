# efface-v2-client — 프론트엔드 아키텍처

`frontend-architecture-master` 스킬의 4축(컴포넌트/데이터 · 스타일링 · 모션 · 보안)을
이 저장소에 적용한 결과를 정리한 문서. 새 컴포넌트를 추가할 때 이 문서의 규약을 따른다.

---

## 1. 컴포넌트 계층 & 데이터 아키텍처

### 1.1 Atomic 계층

| 계층 | 해당 모듈 |
| --- | --- |
| atoms | `LogoMark`, `LanguageToggle`, `Reveal` |
| molecules | `Nav/NavOverlay`, `Footer/FooterMeta`, `Footer/FooterBar`, `sections/Capabilities/CapabilityCard`, `sections/Capabilities/MagnifierLens`, `sections/EffaceIntro/ClutterField`, `sections/EffaceIntro/EraserPuck` |
| organisms | `Nav`, `Footer`, `PolicyIndex`, `sections/*` |
| templates | `app/[locale]/layout.tsx` |
| pages | `app/[locale]/page.tsx`, `app/[locale]/policies/page.tsx` |

### 1.2 Server / Client 경계

App Router 기준으로 **기본은 Server Component**, 아래 사유가 있을 때만 `"use client"`.

| 컴포넌트 | 종류 | 사유 |
| --- | --- | --- |
| `sections/About`, `sections/Approach`, `sections/Contact`, `sections/Work` | Server | 번역 문자열 렌더만 수행 |
| `Reveal` | Client | `whileInView` 뷰포트 관찰 (children은 RSC 그대로 통과) |
| `Nav`, `LanguageToggle` | Client | 상호작용 상태 · 라우터 |
| `Footer`, `PolicyIndex` | Client | rAF 모션 루프 |
| `sections/Hero`, `Capabilities`, `EffaceIntro`, `Work/WorkFeaturedScene`·`WorkFeaturedRow` | Client | 스크롤 바인딩 rAF 씬 |
| `components/three/*` | Client 전용 모듈 | `next/dynamic(ssr:false)` 또는 동적 import로만 로드 |

### 1.3 데이터 페칭 전략

이 사이트는 **외부 런타임 데이터가 없다.** 서버 상태 계층(React Query/SWR)을 두지 않는다.

- 카피: `next-intl` 메시지(`messages/{ko,en}.json`) — 서버에서 주입, 정적 렌더
- 정책 문서: `lib/policies.ts`의 정적 모듈 데이터
- 라우팅: `i18n/routing.ts`의 `defineRouting` + `middleware.ts`
- 페이지는 전부 `generateStaticParams` + `setRequestLocale`로 **정적 생성**

> 서버 액션·API 라우트를 추가하지 않는다. 영업성 기능(폼/견적)을 두지 않는 제품 방침과 맞물려,
> 사용자 입력 경로 자체가 존재하지 않는다.

### 1.4 상태 분리

| 종류 | 저장 위치 |
| --- | --- |
| 서버 데이터 | 없음 (정적 메시지로 대체) |
| URL 상태 | locale — `next-intl` 라우터가 소유 |
| 전역 UI 상태 | `store/ui.store.ts` (Zustand) — 오버레이 메뉴 개폐 |
| 지역 UI 상태 | `useState` — 스크롤 여부, 활성 섹션 등 단일 컴포넌트 소비 |
| 모션 상태 | React state에 두지 않는다. `useRef` + rAF에서 DOM 스타일을 직접 갱신 |

**전역에 올리는 기준**: 두 개 이상의 컴포넌트가 읽거나, `document.body` 같은 전역 부수효과를
동반할 때만. 그 외에는 지역 상태로 둔다. (`isNavOpen`은 body 스크롤 잠금을 유발하므로 전역)

### 1.5 타입 규약

- 컴포넌트 props는 `[Name].types.ts`에 `interface`로 선언하고 `[Name]Props`로 명명
- 유니온·판별 유니온은 `type` (예: `EffaceIntro`의 `Token`, `lib/policies.ts`의 `Block`)
- `any` 금지. 외부 경계는 `unknown` + 타입 가드
- `t.raw()` 반환값은 반드시 선언된 타입으로 좁혀서 사용

---

## 2. 스타일링 전략

### 2.1 토큰

Tailwind v4 `@theme` 블록(`app/globals.css`)이 단일 소스.

| 그룹 | 토큰 |
| --- | --- |
| 배경 | `--color-bg`, `--color-bg-soft`, `--color-surface`, `--color-surface-2` |
| 텍스트 | `--color-fg`, `--color-fg-dim`, `--color-fg-faint` |
| 라인 | `--color-line`, `--color-line-strong` |
| 강조 | `--color-accent`, `--color-accent-bright` |
| 서체 | `--font-sans`, `--font-mono` |

다크 테마 고정. 단일 accent(`#3b62e5`). 씬별 보조 색(카드 그라디언트, 컬럼 accent)은
해당 씬의 `*.constants.ts`에 모아두고 CSS 커스텀 프로퍼티(`--acc`, `--dot`, `--sheen`)로 전달한다.

### 2.2 클래스 합성

조건부 클래스는 **`cn()`**(`lib/cn.ts` = `clsx` + `tailwind-merge`)로 합성한다.
템플릿 리터럴 문자열 결합은 쓰지 않는다 — Tailwind 클래스 충돌이 조용히 남기 때문.

### 2.3 반응형

모바일 퍼스트. `md`(768px)가 이 사이트의 핵심 분기점이며, 그 아래에서는
핀 고정 스크롤 씬을 **정적 스택 레이아웃으로 교체**한다(축소하면 본문이 5~9px로 깨짐).
분기는 `lib/useIsMobile.ts` 하나로 통일하고, SSR 시에는 데스크톱 마크업을 렌더한다.

### 2.4 전역 CSS를 쓰는 경우

Tailwind 유틸로 표현이 불가능한 것만 `globals.css`에 둔다:
`@font-face`, `::selection`, keyframes(`rise-in`/`marquee`/`bob`/`caretBlink`/`scroll-bob`),
의사요소 기반 장식(`.cap-chip::before` 점), `prefers-reduced-motion` 오버라이드.

---

## 3. 모션 안무

### 3.1 토큰 (`lib/motion.ts`)

| 이름 | 값 | 용도 |
| --- | --- | --- |
| `EASE_OUT_EXPO` | `[0.22, 1, 0.36, 1]` | 등장·전환의 기본 곡선 |
| `DURATION.fast` | `0.4` | 오버레이 페이드, 마이크로 인터랙션 |
| `DURATION.base` | `0.6` | 메뉴 항목 스태거 |
| `DURATION.slow` | `0.7` | 섹션 진입(Reveal) |
| `STAGGER.tight` / `.base` | `0.06` / `0.07` | 리스트·메뉴 스태거 |
| `fadeUp`, `overlayFade`, `menuItem` | Variants | 공유 Framer Motion variants |
| `easeOutCubic`, `smoothstep`, `clamp`, `fract` | 스칼라 이징 | rAF · WebGL 씬의 수동 보간 |

수치를 컴포넌트에 하드코딩하지 않는다.

### 3.2 도구 선택

| 용도 | 도구 | 실제 사용처 |
| --- | --- | --- |
| 컴포넌트 진입/전환 | **Framer Motion**(`motion`) | `Reveal`, `Nav` 오버레이, `Hero` 패럴랙스 |
| 스크롤 바인딩 멀티요소 타임라인 | **자체 rAF 루프**(`lib/scrollMotion.ts`) | `EffaceIntro`, `Capabilities`, `Work` 대표작, `Footer`, `PolicyIndex` |
| 3D / WebGL | **three.js** | `HeroScene`(glassScene) |
| 마이크로 인터랙션 | Tailwind transition + CSS keyframes | 링크 밑줄, 캐럿, 마퀴 |

> GSAP은 도입하지 않는다. 씬들이 이미 `IntersectionObserver` + `document.hidden` 게이트가 붙은
> 단일 rAF 루프로 동작하고 있어 ScrollTrigger가 더할 이점이 없으며, 번들만 늘어난다.

### 3.3 공간 안무 원칙

- **Hero**: 배경 WebGL은 제자리에서 순환, 카피는 위로 -24% 이동하며 페이드 → 다음 씬으로 넘김
- **EffaceIntro**: 중앙에서 원이 자라며 잡동사니를 지움 → 지우개가 그 원의 가장자리를 따라감 → 문장이 단어 단위로 점등
- **Work 대표작**: 2개씩 한 줄로 콘텐츠 높이만큼 화면 중앙에 고정 → 두 앱의 미리보기가 같은 런웨이에서 함께 진행(폰 미리보기는 오른쪽에서 슬라이드 인, 4장 이상은 트랙 이동, 웹 캡처는 프레임 안에서 위→아래 스크롤), 가장자리는 페이드·블러 → 홀드 후 고정이 풀리며 다음 줄로 스크롤
- **Capabilities**: 글자 흩어짐 → 조립, 카드가 중앙에서 사방으로 딜링, 착지 후에만 돋보기 렌즈 활성
- **Footer**: 대각선 와이프로 진입, 커서 궤적이 대형 워드마크를 밝힘

### 3.4 성능 규칙

- 애니메이션 프로퍼티는 `transform` / `opacity` / `filter` / `mask-image`만 사용. `width`·`top` 금지
- 모든 rAF 루프는 `IntersectionObserver`(화면 밖) + `document.hidden`(탭 비활성)에서 정지
- 레이아웃을 강제하는 `getBoundingClientRect` 히트 테스트는 커서가 움직인 프레임에만 수행
- 움직이는 요소에만 `will-change` 지정
- 랜덤 산포는 `Math.random()`이 아니라 해시 기반(`fract(sin(i * k) * m)`) — SSR/재마운트 간 동일

### 3.5 Reduced motion

`prefers-reduced-motion: reduce`에서:

- Framer Motion — `useReducedMotion()`으로 `initial`을 끈다
- rAF 씬 — 최종 프레임을 한 번 그리고 루프를 시작하지 않는다
- CSS — `globals.css` 말미의 미디어 쿼리에서 keyframes/transition 무력화
- WebGL — `glassScene`은 `still` 모드로 잠금 포즈 한 프레임만 렌더

---

## 4. 보안 아키텍처

### 4.1 XSS

- `dangerouslySetInnerHTML` / `innerHTML` / `eval` **사용 0건** — 이 상태를 유지한다
- 번역 메시지의 인라인 마크업(`~취소선~`, `*강조*`, `{orb1}`)은 HTML로 파싱하지 않고
  **토큰 배열로 파싱해 React 엘리먼트로 렌더**한다(`sections/EffaceIntro/parseSentence.ts`).
  따라서 카피에 HTML이 들어와도 문자열로만 출력된다
- 캔버스 텍스트는 `fillText`로 그린다 — 마크업 경로가 없다

### 4.2 입력 검증

현재 사용자 입력 경로(폼·쿼리 파라미터 소비·업로드)가 **존재하지 않는다.**
따라서 `zod` 스키마 계층을 두지 않는다. 입력을 받는 기능이 생기면 그 시점에
`zod` 런타임 검증을 경계에 추가하고 이 절을 갱신한다.

동적 라우트 세그먼트인 `locale`은 `hasLocale(routing.locales, locale)`로 화이트리스트 검증 후
불일치 시 `notFound()` — 임의 문자열이 메시지 import 경로로 들어가지 못한다.

### 4.3 URL / 외부 링크

- 외부 링크는 `target="_blank"` + `rel="noreferrer"` (Footer의 `rowLink`)
- 링크 href는 번역 메시지·정적 데이터에서만 오고, 사용자 입력을 보간하지 않는다

### 4.4 CSP / 헤더

`next.config.ts`의 `headers()`가 `X-Content-Type-Options: nosniff`,
`X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`를 전송한다.
인라인 `<script>`를 두지 않아 스크립트 CSP를 조일 수 있는 상태이며,
외부 리소스 출처는 `fonts.googleapis.com` / `fonts.gstatic.com` / `cdn.jsdelivr.net` 세 곳뿐이다.
Pretendard CDN 링크에는 SRI(`integrity`)가 걸려 있다.

---

## 5. 파일 배치 규약

```
app/                     # 라우트 · 레이아웃 · 전역 CSS
components/
  [Name]/
    index.tsx            # re-export만 (import 경로는 @/components/[Name])
    [Name].tsx           # 구현
    [Name].types.ts      # props · 데이터 인터페이스
    [Name].constants.ts  # 씬 상수 (필요 시)
    use[Name]*.ts        # 해당 컴포넌트 전용 훅
    [Child].tsx          # 하위 프레젠테이션 컴포넌트
    [name]Helper.ts      # 프레임워크 비의존 순수 로직 (필요 시)
  sections/[Name]/       # 페이지 섹션도 동일 규약
  three/                 # WebGL 씬 팩토리 — React 비의존
                         #   glassScene / glassLayout / glassMaterials / glassTextures
i18n/                    # next-intl 라우팅 설정
lib/                     # 공용 유틸 · 훅 (cn, motion, scrollMotion, useIsMobile)
  policies/              # 정책 문서 본문 (locale별 파일 + 타입)
messages/                # ko / en 카피
store/                   # Zustand 슬라이스 ([domain].store.ts)
```

**한 파일 300줄을 넘기지 않는다.** 넘으면 상수 / 타입 / 훅 / 순수 로직 / 하위 컴포넌트로 분리한다.
씬 팩토리와 콘텐츠 데이터 파일도 예외가 아니다.

---

## 6. 의존성

이 규약을 위해 추가한 런타임 의존성은 셋뿐이다.

| 패키지 | 용도 |
| --- | --- |
| `clsx` + `tailwind-merge` | `cn()` — 조건부 클래스 합성 및 Tailwind 충돌 해소 |
| `zustand` | 전역 UI 상태 슬라이스 (`store/ui.store.ts`) |

`zod`와 `DOMPurify`는 **도입하지 않았다.** 검증할 사용자 입력과 삽입할 HTML이 이 사이트에
존재하지 않기 때문이다(§4.1, §4.2). 폼이나 외부 콘텐츠 렌더링이 생기면 그때 추가한다.

`GSAP`도 도입하지 않았다 — 사유는 §3.2 참고.
