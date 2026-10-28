import { useTranslations } from "next-intl";
import type { WorkClientsProps } from "./Work.types";

/**
 * "Trusted by" strip — the product's client logos in their own colours (white
 * backdrops knocked out in the assets), drifting sideways on the shared marquee
 * keyframes.
 * Reduced motion stops the drift via the global `.animate-marquee` override.
 */
export default function WorkClients({ clients }: WorkClientsProps) {
  const t = useTranslations("Work.featured");
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-6 pr-6">
      {clients.map((c) => (
        <li key={c.src} className="flex h-12 shrink-0 items-center px-5">
          <img
            src={c.src}
            alt={hidden ? "" : c.name}
            loading="lazy"
            className="h-7 w-auto max-w-[160px] object-contain"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mt-8">
      <p className="text-sm text-fg-faint">{t("clientsLabel")}</p>
      <div className="mt-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex w-max animate-marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
