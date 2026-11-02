import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import LinkedInMark from "@/components/LinkedInMark";
import Reveal from "@/components/Reveal";
import LogoParticle from "@/components/LogoParticle";
import SectionBackdrop from "@/components/SectionBackdrop";
import { STAGGER } from "@/lib/motion";
import type { AboutMeta } from "./About.types";

export default function About() {
  const t = useTranslations("About");
  const paragraphs = t.raw("paragraphs") as string[];
  const meta = t.raw("meta") as AboutMeta[];

  return (
    <section id="about" className="relative isolate overflow-hidden border-t border-line bg-bg py-24 md:py-36">
      <SectionBackdrop src="/about/office.webp" width={1536} height={1024} />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {/* Left: label + heading + mark */}
          <div className="md:col-span-5">
            <Reveal>
              <p className="label">
                <span className="text-accent">//</span> {t("label")}
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                {t("title")}
              </h2>
              <div data-tour="about-logo">
                <LogoParticle className="mt-6 h-56 md:h-72" />
              </div>
            </Reveal>
          </div>

          {/* Right: copy + facts */}
          <div className="md:col-span-7">
            <div className="space-y-6">
              {paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * STAGGER.tight}>
                  <p className="text-base leading-relaxed text-fg-dim md:text-lg">{p}</p>
                </Reveal>
              ))}
            </div>

            {/* Facts: a hairline and two columns, no box. */}
            <Reveal delay={0.2}>
              <dl className="mt-14 grid gap-8 border-t border-white/10 pt-7 sm:grid-cols-2">
                {meta.map((m) => (
                  <div key={m.label}>
                    <dt className="label">{m.label}</dt>
                    <dd className="mt-3 text-lg font-medium tracking-tight text-fg md:text-xl">
                      {m.href ? (
                        <a
                          href={m.href}
                          {...(m.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                          className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent-bright"
                        >
                          {m.value}
                          <span className="ml-1 inline-flex transition-transform group-hover:-translate-y-0.5">
                            {m.href.startsWith("mailto:") ? (
                              <Mail aria-hidden className="h-[18px] w-[18px] text-fg-dim group-hover:text-accent-bright" />
                            ) : (
                              <LinkedInMark size={17} />
                            )}
                          </span>
                        </a>
                      ) : (
                        m.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
