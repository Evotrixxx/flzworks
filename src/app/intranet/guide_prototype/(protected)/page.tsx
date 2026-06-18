"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ArrowRight, ExternalLink } from "lucide-react";
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
      // If no query, show top level or all nodes, but let's just show a default list (e.g. root node)
      return knowledgeBaseData.filter((n) => n.id === "start");
    }

    const scored = knowledgeBaseData
      .map((node) => ({ node, score: scoreNode(node, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.node);
  }, [query]);

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-black text-white">Tudásbázis</h1>
          <p className="text-zinc-400">Miben segíthetünk? Írja le a problémát vagy kérdést.</p>
          
          <div className="relative mx-auto mt-6 max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-zinc-500" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setExpandedId(null);
              }}
              className="block w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-zinc-500 backdrop-blur-xl focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Pl.: Hogyan tudok hirdetést feladni?"
            />
          </div>
        </header>

        <section className="space-y-4">
          {results.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <p className="text-zinc-400">Nincs találat a keresett kifejezésre. Próbálkozzon más szavakkal.</p>
            </div>
          ) : (
            results.map((node) => (
              <div 
                key={node.id} 
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20"
              >
                <button
                  onClick={() => setExpandedId(expandedId === node.id ? null : node.id)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <h2 className="text-xl font-bold text-white">{node.title}</h2>
                  <div className="ml-4 rounded-full bg-white/10 p-2 text-zinc-300">
                    {expandedId === node.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                {expandedId === node.id && (
                  <div className="border-t border-white/10 px-6 pb-6 pt-4">
                    <div className="prose prose-invert max-w-none text-zinc-300">
                      {node.content}
                    </div>
                    
                    {node.children.length > 0 && (
                      <div className="mt-8 space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Kapcsolódó témák / Továbbhaladás</h3>
                        <div className="flex flex-wrap gap-3">
                          {node.children.map((child) => (
                            <button
                              key={child.nodeId}
                              onClick={() => {
                                // Simulate clicking a child link by searching for its title
                                const childNode = knowledgeBaseData.find(n => n.id === child.nodeId);
                                if (childNode) {
                                  setQuery(childNode.title);
                                  setExpandedId(childNode.id);
                                }
                              }}
                              className="group flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
                            >
                              {child.label}
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

        <div className="mt-12 text-center">
           <Link href="/intranet/tree_prototype" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
              <ExternalLink className="h-4 w-4" />
              Átváltás a Call Center nézetre (Gondolattérkép)
           </Link>
        </div>
      </div>
    </main>
  );
}
