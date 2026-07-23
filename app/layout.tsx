import "./globals.css";

// Pass-through root layout. The [locale] layout owns the <html>/<body> shell so
// it can set `lang` per locale. Next.js just requires this file to exist.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
