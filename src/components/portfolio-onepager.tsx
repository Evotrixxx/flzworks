"use client";

import { ArrowUpRight } from "lucide-react";
import { portfolioFocuses, portfolioSocials } from "@/lib/portfolio";
import type { InstagramMediaItem } from "@/lib/instagram";
import { ThemeSwitcher } from "./theme-switcher";
import Image from "next/image";

export function PortfolioOnepager({ instagramMedia }: { instagramMedia: InstagramMediaItem[] }) {
  const enabledSocials = portfolioSocials.filter((s) => s.href);

  return (
    <div className="neo-bg min-h-screen text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Marquee Header */}
      <div className="w-full border-b border-white/10 bg-black py-2 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="text-xs font-black uppercase tracking-widest text-zinc-500 mx-4">
              FLZ // DESIGN // ENGINEERING // MACHINE EXPERIENCE // 2026 //
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Intro / Hero Bento (Spans 8 cols) */}
        <div className="neo-bento-card p-8 lg:col-span-8 flex flex-col justify-between min-h-[400px]">
          <header className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
                FLZ<br />
                <span className="neo-text-outline">WORKS</span>
              </h1>
              <p className="text-zinc-400 font-mono text-sm max-w-md">
                Systems architecture, high-performance web, and prototype engineering.
              </p>
            </div>
            <ThemeSwitcher />
          </header>
          
          <div className="flex flex-wrap gap-3 mt-auto">
            {enabledSocials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="neo-button flex items-center gap-2 px-6 py-3 text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Index Bento (Spans 4 cols) */}
        <div className="neo-bento-card p-8 lg:col-span-4 flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6 border-b border-white/10 pb-4">
            Index Focus
          </h2>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {portfolioFocuses.map((focus, i) => (
              <div key={focus.id} className="flex flex-col group cursor-default">
                <span className="text-xs font-mono text-zinc-600 mb-1">0{i+1}</span>
                <h3 className="text-2xl lg:text-3xl font-black uppercase tracking-tight group-hover:neo-accent-text transition-colors">
                  {focus.label}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Works Bento Grid */}
        <div className="lg:col-span-12 mt-8">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter neo-text-outline mb-6">Archive</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {portfolioFocuses.flatMap(focus => focus.works).map((work, i) => (
              <a 
                key={work.title} 
                href={work.href}
                target="_blank"
                rel="noreferrer"
                className="neo-bento-card p-6 flex flex-col justify-between group h-64"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-zinc-500">#{String(i+1).padStart(3, "0")}</span>
                  <ArrowUpRight className="h-6 w-6 text-zinc-600 group-hover:neo-accent-text transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none group-hover:text-white text-zinc-200 transition-colors">
                    {work.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Execute _</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Instagram Grid */}
        {instagramMedia.length > 0 && (
          <div className="lg:col-span-12 mt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-white/10 pb-4">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Transmission Log</h2>
              <p className="text-xs font-mono text-zinc-500 mt-2 md:mt-0">LIVE FEED // IG</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {instagramMedia.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="neo-bento-card aspect-square relative group"
                >
                  {(item.thumbnail_url || item.media_url) && (
                    <Image
                      src={item.thumbnail_url || item.media_url || ""}
                      alt={item.caption || "Instagram post"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                      unoptimized
                    />
                  )}
                  <div className="absolute inset-0 border-[4px] border-transparent group-hover:border-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
