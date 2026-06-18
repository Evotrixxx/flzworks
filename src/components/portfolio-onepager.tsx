"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ExternalLink, LockKeyhole, Radio } from "lucide-react";
import { portfolioFocuses, portfolioSocials, type PortfolioFocusId } from "@/lib/portfolio";
import type { InstagramMediaItem } from "@/lib/instagram";
import { autopiacPath } from "@/lib/routes";

export function PortfolioOnepager({ instagramMedia }: { instagramMedia: InstagramMediaItem[] }) {
  const [activeId, setActiveId] = useState<PortfolioFocusId>("godot");
  const activeIndex = portfolioFocuses.findIndex((focus) => focus.id === activeId);
  const active = portfolioFocuses[activeIndex] ?? portfolioFocuses[0];
  const ActiveIcon = active.icon;

  const enabledSocials = useMemo(
    () => portfolioSocials.filter((social) => social.href.trim().length > 0),
    [],
  );

  return (
    <main className="portfolio-shell min-h-screen overflow-hidden bg-black text-zinc-50">
      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-rows-[auto_1fr] px-4 py-5 sm:px-6 lg:px-8">
        <header className="portfolio-glass-panel z-20 flex items-center justify-between gap-4 rounded-full px-4 py-3">
          <Link href="/" className="text-sm font-black tracking-[0.24em] text-white">
            FLZ
          </Link>
          <nav className="scrollbar-none flex min-w-0 items-center gap-2 overflow-x-auto">
            {portfolioFocuses.map((focus) => (
              <button
                key={focus.id}
                type="button"
                onClick={() => setActiveId(focus.id)}
                className={`portfolio-liquid-button h-9 shrink-0 rounded-full px-3 text-xs font-bold transition ${
                  focus.id === active.id ? "portfolio-liquid-button-active" : "text-zinc-300"
                }`}
              >
                {focus.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="grid min-h-0 items-center gap-8 py-8 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="relative z-10 grid content-center gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-zinc-300 backdrop-blur-xl">
              <Radio className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
              personal work index
            </div>

            <div className="portfolio-focus-window">
              <div
                className="portfolio-focus-track"
                style={{ transform: `translateY(-${activeIndex * 100}%)` }}
              >
                {portfolioFocuses.map((focus) => {
                  const Icon = focus.icon;
                  return (
                    <article key={focus.id} className="portfolio-focus-slide" aria-hidden={focus.id !== active.id}>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <span className="portfolio-icon-glass flex h-12 w-12 items-center justify-center rounded-lg">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-semibold">{focus.eyebrow}</span>
                      </div>
                      <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                        FLZ <span className="text-zinc-500">|</span>{" "}
                        <span className="portfolio-title-sheen">{focus.label}</span>
                      </h1>
                      <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-zinc-300 sm:text-lg">
                        {focus.summary}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {active.metrics.map((metric) => (
                <span key={metric} className="portfolio-glass-chip rounded-full px-3 py-2 text-xs font-bold text-zinc-200">
                  {metric}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {enabledSocials.length ? (
                enabledSocials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="portfolio-liquid-button portfolio-liquid-button-active inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {social.label}
                    </a>
                  );
                })
              ) : (
                <div className="portfolio-glass-panel rounded-lg px-4 py-3 text-sm font-semibold text-zinc-400">
                  Social links are ready for Instagram, Facebook, and Pinterest URLs.
                </div>
              )}
              <Link
                href={autopiacPath()}
                className="portfolio-liquid-button inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-black text-zinc-200"
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                AutoPiac intranet
              </Link>
            </div>
          </section>

          <section className="relative z-10 min-w-0">
            <div className="portfolio-glass-panel rounded-lg p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Chronological work</p>
                  <h2 className="mt-1 text-xl font-black text-white">{active.label}</h2>
                </div>
                <ActiveIcon className="h-6 w-6 text-cyan-100" aria-hidden="true" />
              </div>
              <div className="scrollbar-none flex snap-x gap-4 overflow-x-auto pb-3">
                {active.works.map((work, index) => (
                  <article
                    key={work.title}
                    className="portfolio-work-card min-w-[260px] snap-start rounded-lg p-5 sm:min-w-[330px]"
                  >
                    <div className="portfolio-work-visual mb-5 flex aspect-[4/3] items-end rounded-lg p-4">
                      <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-black text-white backdrop-blur-xl">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">{work.year}</p>
                    <h3 className="mt-3 text-2xl font-black text-white">{work.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{work.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="portfolio-glass-panel mt-4 rounded-lg p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Social stream</p>
                  <h2 className="mt-1 text-xl font-black text-white">Instagram journal</h2>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" aria-hidden="true" />
              </div>
              {instagramMedia.length ? (
                <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
                  {instagramMedia.map((item) => (
                    <a
                      key={item.id}
                      href={item.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="portfolio-social-card grid min-w-[220px] gap-3 rounded-lg p-3"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
                        {(item.thumbnail_url || item.media_url) && (
                          <Image
                            src={item.thumbnail_url || item.media_url || ""}
                            alt={item.caption || "Instagram post"}
                            fill
                            sizes="220px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300">
                        Open post <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-5 text-sm font-semibold leading-6 text-zinc-400">
                  Instagram automation is configured for the official Meta path. Add `INSTAGRAM_ACCESS_TOKEN`
                  and `INSTAGRAM_USER_ID` to show recent posts here.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
