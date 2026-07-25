import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en"],
  // English is the default: `/` serves EN and Korean lives at `/ko`
  // (localePrefix "as-needed" omits the prefix for the default locale).
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: {
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});

export type Locale = (typeof routing.locales)[number];
