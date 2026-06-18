import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GuidePrototypePage() {
  return (
    <main className="portfolio-shell grid min-h-screen place-items-center overflow-hidden bg-black px-4 py-10 text-zinc-50">
      <section className="relative z-10 grid w-full max-w-xl gap-5">
        <div className="portfolio-glass-panel rounded-lg p-6 text-center">
          <h1 className="text-3xl font-black text-white">Guide Prototype</h1>
          <p className="mt-4 text-sm font-semibold leading-6 text-zinc-400">
            Welcome to the securely scoped Guide Prototype module.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="portfolio-liquid-button portfolio-liquid-button-active inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
