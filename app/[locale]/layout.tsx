import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Nav from "@/components/Nav";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Canonical origin for metadata (canonical links, hreflang, OG/Twitter URLs).
// Set NEXT_PUBLIC_SITE_URL per environment; falls back to the v2 host.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://v2.efface.dev").replace(
  /\/$/,
  ""
);
const OG_IMAGE = `${SITE_URL}/og.jpg`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const title = t("title");
  const description = t("description");
  const url = locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | efface" },
    description,
    applicationName: "efface",
    keywords: [
      "efface",
      "개발 스튜디오",
      "AI 개발",
      "웹 개발",
      "앱 개발",
      "development studio",
      "AI",
      "Next.js",
    ],
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        routing.locales.map((l) => [
          l,
          l === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${l}`,
        ])
      ),
    },
    openGraph: {
      type: "website",
      url,
      siteName: "efface",
      title,
      description,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "efface" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className="dark">
      <head>
        {/* Preconnect so first paint isn't blocked by font DNS/TLS. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Archivo Black — the oversized display word behind the app cards.
           Space Grotesk — the footer wordmark (also drawn into a canvas). */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@500;700&display=swap"
        />
        {/* Pretendard Variable dynamic-subset — only the unicode ranges used on
           the page are fetched (~200KB vs 2MB). SRI pinned to 1.3.9. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
          integrity="sha384-2nNKoOPayicGa+aRguOQuiZP+RqQ4G3jalfDeOgftkKD7zBM2gJXTwcFqCZltdv0"
          crossOrigin="anonymous"
        />
        <meta name="theme-color" content="#0a0a0b" />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <NextIntlClientProvider>
          <Nav />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
