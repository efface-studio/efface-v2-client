import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en"],
  defaultLocale: "ko",
  localePrefix: "as-needed",
  localeCookie: {
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});

export type Locale = (typeof routing.locales)[number];
