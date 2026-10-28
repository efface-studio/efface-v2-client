import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { STAGGER } from "@/lib/motion";
import type { ApproachItem } from "./Approach.types";

export default function Approach() {
  const t = useTranslations("Approach");
  const items = t.raw("items") as ApproachItem[];
  const stack = t.raw("stack") as string[];

  return (
    <section id="approach" className="relative border-t border-line bg-bg-soft py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {/* Left: heading */}
          <div className="md:col-span-5">
            <Reveal>
              <p className="label">
                <span className="text-accent">//</span> {t("label")}
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {t("title")}
              </h2>
              <p className="mt-6 max-w-md text-fg-dim">{t("lead")}</p>
            </Reveal>
          </div>

          {/* Right: principles */}
          <div className="md:col-span-7">
            <ul className="border-t border-line">
              {items.map((item, i) => (
                <li key={item.no} className="border-b border-line">
                  <Reveal delay={i * STAGGER.tight}>
                    <div className="group flex gap-6 py-7 md:gap-8 md:py-8">
                      <span className="font-mono text-sm text-accent">{item.no}</span>
                      <div>
                        <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                          {item.title}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-fg-dim md:text-base">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech stack marquee */}
        <div className="relative mt-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] md:mt-28">
          <div className="flex w-max animate-marquee items-center gap-8 md:gap-12">
            {[...stack, ...stack].map((s, i) => (
              <span
                key={`${s}-${i}`}
                className="flex items-center gap-8 whitespace-nowrap font-mono text-sm text-fg-faint md:gap-12"
              >
                {s}
                <span className="h-1 w-1 rounded-full bg-fg-faint/40" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
