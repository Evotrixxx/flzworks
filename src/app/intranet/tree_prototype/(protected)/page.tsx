"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { knowledgeBaseData, KnowledgeNode } from "@/data/knowledge-base";
import Link from "next/link";
import { BookOpen, Maximize2, Move } from "lucide-react";

const NODE_WIDTH = 320;
const NODE_HEIGHT = 160;
const X_GAP = 60;
const Y_GAP = 120;

// Simple layout algorithm
const positions: Record<string, { x: number; y: number }> = {};

function calculateSubtreeWidth(nodeId: string): number {
  const node = knowledgeBaseData.find((n) => n.id === nodeId);
  if (!node || node.children.length === 0) return NODE_WIDTH;

  let totalWidth = 0;
  for (const child of node.children) {
    totalWidth += calculateSubtreeWidth(child.nodeId) + X_GAP;
  }
  return totalWidth - X_GAP;
}

function layoutTree(nodeId: string, x: number, y: number) {
  positions[nodeId] = { x, y };
  const node = knowledgeBaseData.find((n) => n.id === nodeId);
  if (!node || node.children.length === 0) return;

  const totalWidth = calculateSubtreeWidth(nodeId);
  let currentX = x - totalWidth / 2;

  for (const child of node.children) {
    const childWidth = calculateSubtreeWidth(child.nodeId);
    layoutTree(child.nodeId, currentX + childWidth / 2, y + NODE_HEIGHT + Y_GAP);
    currentX += childWidth + X_GAP;
  }
}

// Initialize layout starting from root
layoutTree("start", 0, 0);

export default function TreePrototypePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Center on root initially
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setTransform({
        x: clientWidth / 2,
        y: clientHeight / 4,
        scale: 1,
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Right click (button 2) or middle click
    if (e.button === 2 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTransform((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAdjust = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.2, transform.scale + scaleAdjust), 3);
    setTransform((prev) => ({
      ...prev,
      scale: newScale,
    }));
  };

  const centerOnNode = useCallback((nodeId: string) => {
    const pos = positions[nodeId];
    if (pos && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setTransform((prev) => ({
        ...prev,
        x: clientWidth / 2 - pos.x * prev.scale,
        y: clientHeight / 2 - pos.y * prev.scale,
      }));
      setFocusedNodeId(nodeId);
    }
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden select-none">

      {/* Floating pill topbar */}
      <header className="autopiac-topbar pointer-events-auto" role="banner">
        <div className="mx-auto flex h-full items-center justify-between px-5 gap-4">
          <Link
            href="/"
            className="shrink-0 text-sm font-black uppercase tracking-widest text-white/90 transition hover:text-white"
          >
            FLZ
          </Link>

          <div className="flex flex-col items-center">
            <span className="text-[0.82rem] font-black text-white/90 uppercase tracking-widest">
              Call Center Gondolattérkép
            </span>
            <span className="flex items-center gap-3 text-[0.68rem] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Move className="h-3 w-3" aria-hidden="true" />
                Jobb klikk: Mozgatás
              </span>
              <span>·</span>
              <span>Dupla klikk: Fókusz</span>
              <span>·</span>
              <span>Görgő: Zoom</span>
            </span>
          </div>

          <Link
            href="/intranet/guide_prototype"
            className="autopiac-nav-link shrink-0 gap-1.5 text-[0.78rem] font-semibold text-zinc-300"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Tudásbázis
          </Link>
        </div>
      </header>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="absolute left-0 top-0 origin-top-left transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          }}
        >
          {/* SVG Lines Layer */}
          <svg className="absolute left-0 top-0 overflow-visible">
            {knowledgeBaseData.map((node) => {
              const startPos = positions[node.id];
              if (!startPos) return null;

              return node.children.map((child) => {
                const endPos = positions[child.nodeId];
                if (!endPos) return null;

                const startX = startPos.x;
                const startY = startPos.y + NODE_HEIGHT / 2;
                const endX = endPos.x;
                const endY = endPos.y - NODE_HEIGHT / 2;

                const cp1X = startX;
                const cp1Y = startY + Y_GAP / 2;
                const cp2X = endX;
                const cp2Y = endY - Y_GAP / 2;

                const isFocusedLine =
                  focusedNodeId === node.id || focusedNodeId === child.nodeId;

                return (
                  <g key={`${node.id}-${child.nodeId}`}>
                    <path
                      d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
                      fill="none"
                      stroke={
                        isFocusedLine
                          ? "var(--accent-aqua)"
                          : "rgba(255,255,255,0.12)"
                      }
                      strokeWidth={isFocusedLine ? 3 : 1.5}
                      className="transition-all duration-300"
                    />
                    {/* Line Label */}
                    <foreignObject
                      x={(startX + endX) / 2 - 60}
                      y={(startY + endY) / 2 - 12}
                      width="120"
                      height="24"
                      className="overflow-visible"
                    >
                      <div className="flex justify-center">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold backdrop-blur-md"
                          style={{
                            background: isFocusedLine
                              ? "color-mix(in srgb, var(--accent-aqua) 20%, rgba(0,0,0,0.7))"
                              : "rgba(0,0,0,0.5)",
                            color: isFocusedLine ? "var(--accent-aqua)" : "rgba(255,255,255,0.5)",
                            border: `1px solid ${isFocusedLine ? "color-mix(in srgb, var(--accent-aqua) 35%, transparent)" : "rgba(255,255,255,0.08)"}`,
                          }}
                        >
                          {child.label}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              });
            })}
          </svg>

          {/* Nodes Layer */}
          {knowledgeBaseData.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isFocused = focusedNodeId === node.id;

            return (
              <div
                key={node.id}
                onDoubleClick={() => centerOnNode(node.id)}
                className={`glass-panel absolute flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
                  isFocused
                    ? "z-20 scale-105"
                    : "z-10"
                }`}
                style={{
                  left: pos.x - NODE_WIDTH / 2,
                  top: pos.y - NODE_HEIGHT / 2,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  boxShadow: isFocused
                    ? `0 0 0 2px var(--accent-aqua), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px color-mix(in srgb, var(--accent-aqua) 25%, transparent)`
                    : undefined,
                }}
              >
                {/* Node header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3">
                  <h3 className="text-sm font-black text-white">{node.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      centerOnNode(node.id);
                    }}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                    title="Fókuszálás"
                    aria-label={`Fókuszálás: ${node.title}`}
                  >
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Node body */}
                <div className="scrollbar-none flex-1 overflow-y-auto p-4 text-[0.78rem] leading-relaxed text-slate-300">
                  {node.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
