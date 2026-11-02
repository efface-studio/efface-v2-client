import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en"],
  // English is the default: `/` serves EN and Korean lives at `/ko`
  // (localePrefix "as-needed" omits the prefix for the default locale).
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Always land on English, wherever the visitor is: no redirect from the
  // browser's Accept-Language, and no remembered-locale cookie. Korean is
  // reached by `/ko` or the KO/EN toggle.
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
