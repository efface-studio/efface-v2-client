import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function Contact() {
  const t = useTranslations("Contact");
  const email = t("email");

  return (
    <section id="contact" className="relative border-t border-line bg-bg py-28 md:py-44">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">
            <span className="text-accent">//</span> {t("label")}
          </p>
          <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-lg text-fg-dim md:text-lg">{t("lead")}</p>

          <a
            href={`mailto:${email}`}
            className="group mt-12 inline-flex items-center gap-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:mt-16 md:text-5xl"
          >
            <span className="link-underline">{email}</span>
            <ArrowUpRight
              className="h-7 w-7 text-accent transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 md:h-10 md:w-10"
              strokeWidth={1.75}
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
