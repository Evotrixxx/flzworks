"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { knowledgeBaseData, KnowledgeNode } from "@/data/knowledge-base";
import Link from "next/link";
import { ExternalLink, Maximize } from "lucide-react";

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
        y: clientHeight / 4, // start slightly higher
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
    // Zoom in/out based on cursor position
    e.preventDefault();
    const scaleAdjust = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.2, transform.scale + scaleAdjust), 3);
    
    // Zooming around center roughly
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
    <div className="relative h-screen w-full overflow-hidden bg-[#050505] text-zinc-50 font-sans select-none">
      
      {/* Header Overlay */}
      <div className="pointer-events-none absolute left-0 top-0 z-50 flex w-full items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-black text-white drop-shadow-md">Call Center Gondolattérkép</h1>
          <p className="text-sm text-zinc-400 drop-shadow-md">Jobb klikk: Mozgatás | Dupla kattintás: Fókusz | Görgő: Zoom</p>
        </div>
        <div className="pointer-events-auto">
          <Link href="/intranet/guide_prototype" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-white/10">
            Tudásbázis Kereső
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>

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

                // Control points for a smooth bezier curve
                const startX = startPos.x;
                const startY = startPos.y + NODE_HEIGHT / 2;
                const endX = endPos.x;
                const endY = endPos.y - NODE_HEIGHT / 2;

                const cp1X = startX;
                const cp1Y = startY + Y_GAP / 2;
                const cp2X = endX;
                const cp2Y = endY - Y_GAP / 2;

                return (
                  <g key={`${node.id}-${child.nodeId}`}>
                    <path
                      d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
                      fill="none"
                      stroke={focusedNodeId === node.id || focusedNodeId === child.nodeId ? "#3b82f6" : "rgba(255,255,255,0.1)"}
                      strokeWidth={focusedNodeId === node.id || focusedNodeId === child.nodeId ? 3 : 2}
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
                        <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-zinc-400 backdrop-blur-md border border-white/5">
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
                className={`absolute flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isFocused
                    ? "z-20 scale-105 border-blue-500 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                    : "z-10 border-white/10 bg-white/5 hover:border-white/20"
                } backdrop-blur-xl`}
                style={{
                  left: pos.x - NODE_WIDTH / 2,
                  top: pos.y - NODE_HEIGHT / 2,
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                }}
              >
                <div className="pointer-events-auto border-b border-white/5 bg-black/40 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">{node.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        centerOnNode(node.id);
                      }}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors"
                      title="Fókuszálás"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="pointer-events-auto flex-1 overflow-y-auto p-4 text-sm text-zinc-300 scrollbar-thin">
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
