import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import FluidInk from "@/components/FluidInk/FluidInk";
import Reveal from "@/components/Reveal";

interface ContactChannel {
  label: string;
  note: string;
  email: string;
}

export default function Contact() {
  const t = useTranslations("Contact");
  const channels = t.raw("channels") as ContactChannel[];

  return (
    <section id="contact" className="relative isolate overflow-hidden border-t border-line bg-bg py-28 md:py-44">
      {/* Ink drifting behind the copy; the pointer stirs it from anywhere in
          the section. Dimmed so the addresses stay the brightest thing here. */}
      <FluidInk className="absolute inset-0 -z-10 opacity-75" />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">
            <span className="text-accent">//</span> {t("label")}
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-lg text-fg-dim md:text-lg">{t("lead")}</p>

        </Reveal>

        {/* The inboxes stacked as big ruled rows: the address carries the row,
            what it's for sits quietly at the far edge. */}
        <Reveal delay={0.15}>
          <ul className="mt-14 border-t border-white/10 md:mt-20">
            {channels.map((c) => (
              <li key={c.email} className="border-b border-white/10">
                <a
                  href={`mailto:${c.email}`}
                  className="group flex flex-col gap-2 py-6 md:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8"
                >
                  <span className="flex min-w-0 items-center gap-3 break-all text-2xl font-semibold tracking-tight text-fg transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-accent-bright sm:text-3xl md:text-5xl">
                    {c.email}
                    <ArrowUpRight
                      aria-hidden
                      className="h-6 w-6 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:h-9 md:w-9"
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="shrink-0 text-sm text-fg-dim lg:text-right">
                    <span className="label mr-3">{c.label}</span>
                    {c.note}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
