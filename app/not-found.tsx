import "./globals.css";

// Root-level 404 (outside the [locale] shell) — provides its own document.
export default function NotFound() {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-bg text-fg antialiased">
        <div className="px-6 text-center">
          <p className="font-mono text-sm text-accent">404</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Page not found
          </h1>
          <a
            href="/"
            className="link-underline mt-6 inline-block text-sm text-fg-dim hover:text-fg"
          >
            ← efface
          </a>
        </div>
      </body>
    </html>
  );
}
