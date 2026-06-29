"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ArrowRight, BookOpen, Network } from "lucide-react";
import { knowledgeBaseData, KnowledgeNode } from "@/data/knowledge-base";
import Link from "next/link";

function scoreNode(node: KnowledgeNode, query: string): number {
  if (!query) return 0;
  
  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);
  
  let score = 0;
  
  for (const word of queryWords) {
    if (word.length < 2) continue;

    // +3 points for Title match
    if (node.title.toLowerCase().includes(word)) {
      score += 3;
    }
    
    // +2 points for Keyword match
    if (node.keywords.some((kw) => kw.toLowerCase().includes(word))) {
      score += 2;
    }
    
    // +1 point for Content match (if it's a string)
    if (typeof node.content === "string" && node.content.toLowerCase().includes(word)) {
      score += 1;
    }
  }

  return score;
}

export default function GuidePrototypePage() {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) {
      return knowledgeBaseData.filter((n) => n.id === "start");
    }

    const scored = knowledgeBaseData
      .map((node) => ({ node, score: scoreNode(node, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.node);
  }, [query]);

  return (
    <>
      {/* Animated background blobs — inherits ap3d-shell context from layout */}
      <div className="showroom-shapes" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* Floating pill topbar */}
      <header className="autopiac-topbar" role="banner">
        <div className="mx-auto flex h-full items-center justify-between px-5 gap-4">
          <Link
            href="/"
            className="shrink-0 text-sm font-black uppercase tracking-widest text-white/90 transition hover:text-white"
          >
            FLZ
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-1 text-sm font-semibold text-zinc-300">
            <span className="flex items-center gap-2 px-3 text-[0.82rem] text-white/70">
              <BookOpen className="h-4 w-4 text-[var(--accent-aqua)]" aria-hidden="true" />
              Tudásbázis
            </span>
          </nav>

          <Link
            href="/intranet/tree_prototype"
            className="autopiac-nav-link shrink-0 gap-1.5 text-[0.78rem] font-semibold text-zinc-300"
          >
            <Network className="h-3.5 w-3.5" aria-hidden="true" />
            Mind Map
          </Link>
        </div>
      </header>

      <main className="showroom-page relative z-10">
        <div className="mx-auto w-full max-w-3xl space-y-8 pt-4">

          {/* Hero search header */}
          <header className="space-y-3 text-center">
            <p className="showroom-kicker">Tudásbázis keresése</p>
            <h1 className="text-4xl font-black leading-none text-white">
              Miben segíthetünk?
            </h1>
            <p className="text-sm text-slate-400">Írja le a problémát vagy kérdést.</p>

            {/* Search input */}
            <div className="relative mx-auto mt-6 max-w-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-[var(--accent-aqua)]" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setExpandedId(null);
                }}
                className="block w-full py-4 pl-12 pr-4 text-white"
                placeholder="Pl.: Hogyan tudok hirdetést feladni?"
                aria-label="Keresés a tudásbázisban"
              />
            </div>
          </header>

          {/* Results */}
          <section className="space-y-3" aria-label="Találatok">
            {results.length === 0 ? (
              <div className="glass-panel rounded-xl p-10 text-center">
                <p className="font-semibold text-slate-400">
                  Nincs találat a keresett kifejezésre. Próbálkozzon más szavakkal.
                </p>
              </div>
            ) : (
              results.map((node) => (
                <div key={node.id} className="glass-surface overflow-hidden rounded-xl">
                  <button
                    onClick={() => setExpandedId(expandedId === node.id ? null : node.id)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:opacity-90"
                    aria-expanded={expandedId === node.id}
                  >
                    <h2 className="text-lg font-black text-white">{node.title}</h2>
                    <span className="glass-chip ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition">
                      {expandedId === node.id
                        ? <ChevronUp className="h-5 w-5" aria-hidden="true" />
                        : <ChevronDown className="h-5 w-5" aria-hidden="true" />
                      }
                    </span>
                  </button>

                  {expandedId === node.id && (
                    <div className="border-t border-white/10 px-5 pb-6 pt-4">
                      <div className="text-sm leading-relaxed text-slate-300">
                        {node.content}
                      </div>

                      {node.children.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h3 className="showroom-kicker">Kapcsolódó témák</h3>
                          <div className="flex flex-wrap gap-2">
                            {node.children.map((child) => (
                              <button
                                key={child.nodeId}
                                onClick={() => {
                                  const childNode = knowledgeBaseData.find(n => n.id === child.nodeId);
                                  if (childNode) {
                                    setQuery(childNode.title);
                                    setExpandedId(childNode.id);
                                  }
                                }}
                                className="liquid-button-secondary group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition"
                              >
                                {child.label}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* Footer link to tree view */}
          <div className="pb-10 text-center">
            <Link
              href="/intranet/tree_prototype"
              className="liquid-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-200 transition"
            >
              <Network className="h-4 w-4" aria-hidden="true" />
              Átváltás a Call Center nézetre (Gondolattérkép)
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
