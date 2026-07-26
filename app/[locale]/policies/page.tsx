import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getPolicies } from "@/lib/policies";
import LogoMark from "@/components/LogoMark";
import PolicyIndex from "@/components/PolicyIndex";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const p = getPolicies(locale);
  return {
    title: p.pageTitle,
    description: p.pageLead,
    // drafts, and not content we want ranking above the product pages
    robots: { index: false, follow: true },
  };
}

export default async function PoliciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { navLabel, pageTitle, pageLead, home, sections } = getPolicies(locale);

  return (
    <main className="min-h-screen bg-bg text-fg">
      {/* sticky page header */}
      <div className="sticky top-0 z-10 border-b border-line bg-bg/[0.86] backdrop-blur-[14px]">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-6 md:px-12">
          <div className="flex items-center gap-[11px]">
            <LogoMark className="h-[22px] w-[22px] text-fg" />
            <span className="policy-wordmark">efface</span>
            <span className="policy-kicker ml-2.5">POLICY</span>
          </div>
          <Link href="/" className="text-[13.5px] text-fg-dim transition-colors hover:text-fg">
            {home}
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1180px] items-start gap-16 px-6 pb-32 pt-14 md:px-12 md:pt-[72px] lg:gap-[72px]">
        <PolicyIndex
          label={navLabel}
          items={sections.map((s) => ({ id: s.id, title: s.title }))}
        />

        <div className="min-w-0 flex-1 lg:max-w-[720px]">
          <h1 data-intro="" className="policy-anim m-0 text-[28px] font-bold tracking-[-0.02em] md:text-[34px]">
            {pageTitle}
          </h1>
          <p data-intro="" className="policy-anim mb-16 mt-2.5 text-[15px] leading-[1.7] text-fg-dim md:mb-[72px]">
            {pageLead}
          </p>

          {sections.map((s) => (
            <section key={s.id} id={s.id} data-sec="" className="policy-anim policy-section">
              <div className="policy-kicker policy-kicker--accent">
                // {s.num} {s.kicker}
              </div>
              <h2 className="m-0 mb-1.5 text-[21px] font-bold tracking-[-0.01em] md:text-[23px]">
                {s.title}
              </h2>
              <div className="policy-date">{s.date}</div>

              <div className="flex flex-col gap-[18px] text-[15px] leading-[1.85] text-fg-dim">
                {s.blocks.map((b, i) =>
                  b.kind === "p" ? (
                    <p key={i} className="m-0">
                      {b.text}
                    </p>
                  ) : b.kind === "h" ? (
                    <div key={i}>
                      <strong className="font-semibold text-[#D8D8DE]">{b.heading}</strong>
                      <br />
                      {b.text}
                    </div>
                  ) : (
                    <ul key={i} className="policy-pairs">
                      {b.pairs.map(([name, license]) => (
                        <li key={name}>
                          <span className="policy-pairs__name">{name}</span>
                          <span className="policy-pairs__value">{license}</span>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
