import "./globals.css";
import { RootFallbackShell } from "@/components/root-fallback-shell";
import CoralogixProvider from "@/libs/coralogix";

export default function NotFoundPage() {
  return (
    <RootFallbackShell>
      <main className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-bodyXL-Highlight text-text-general-brand-identity">
          Not Found
        </p>
        <h1 className="text-web-h1">404</h1>
        <p className="text-bodyM-Neutral">
          The page you are looking for does not exist.
        </p>
      </main>
      <CoralogixProvider />
    </RootFallbackShell>
  );
}
