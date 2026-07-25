import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <Link
          href="/"
          className="link-underline mt-6 inline-block text-sm text-fg-dim hover:text-fg"
        >
          ← efface
        </Link>
      </div>
    </div>
  );
}
