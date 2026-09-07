import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import LogoMark from "@/components/LogoMark";
import { STAGGER } from "@/lib/motion";
import type { AboutMeta } from "./About.types";

export default function About() {
  const t = useTranslations("About");
  const paragraphs = t.raw("paragraphs") as string[];
  const meta = t.raw("meta") as AboutMeta[];

  return (
    <section id="about" className="relative border-t border-line bg-bg py-24 md:py-36">
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
              <LogoMark className="mt-10 hidden h-12 w-12 text-fg-faint md:block" />
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

            <Reveal delay={0.2}>
              <dl className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
                {meta.map((m) => (
                  <div key={m.label} className="bg-bg p-6">
                    <dt className="label">{m.label}</dt>
                    <dd className="mt-2 text-sm text-fg md:text-base">{m.value}</dd>
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
