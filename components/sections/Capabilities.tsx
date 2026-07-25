import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";

type Group = { no: string; title: string; items: string[]; tools: string[] };

export default function Capabilities() {
  const t = useTranslations("Capabilities");
  const groups = t.raw("groups") as Group[];

  return (
    <section id="capabilities" className="relative border-t border-line bg-bg py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">
            <span className="text-accent">//</span> {t("label")}
          </p>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-fg-dim">{t("lead")}</p>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:mt-20 md:grid-cols-2">
          {groups.map((group, i) => (
            <Reveal key={group.no} delay={i * 0.06} className="h-full">
              <article className="group flex h-full flex-col bg-bg p-8 transition-colors duration-300 hover:bg-bg-soft md:p-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-accent">{group.no}</span>
                  <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                    {group.title}
                  </h3>
                </div>

                <ul className="mt-7 flex-1 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-fg-dim">
                      <span
                        className="mt-[0.6em] h-px w-3 shrink-0 bg-fg-faint/60 transition-colors duration-300 group-hover:bg-accent"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <ul className="mt-8 flex flex-wrap gap-2">
                  {group.tools.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fg-faint"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
