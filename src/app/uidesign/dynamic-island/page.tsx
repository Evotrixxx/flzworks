"use client";

import { useState, useEffect } from "react";

type IslandState = "idle" | "faceid" | "call" | "music" | "silent";

export default function DynamicIslandPage() {
  const [islandState, setIslandState] = useState<IslandState>("idle");
  const [faceidSuccess, setFaceidSuccess] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-reset FaceID after a brief scan
  useEffect(() => {
    if (islandState === "faceid") {
      setFaceidSuccess(false);
      const scanTimer = setTimeout(() => {
        setFaceidSuccess(true);
        const resetTimer = setTimeout(() => {
          setIslandState("idle");
        }, 1200);
        return () => clearTimeout(resetTimer);
      }, 1500);
      return () => clearTimeout(scanTimer);
    }
  }, [islandState]);

  const triggerState = (state: IslandState) => {
    if (islandState === state) {
      setIslandState("idle");
    } else {
      setIslandState(state);
    }
  };

  return (
    <div className="di-root">
      {/* Dynamic Ambient Background */}
      <div className="di-bg-glow" style={{
        background: islandState === "faceid" 
          ? "radial-gradient(circle at 50% 10%, rgba(52, 211, 153, 0.15) 0%, transparent 60%)"
          : islandState === "call"
          ? "radial-gradient(circle at 50% 10%, rgba(96, 165, 250, 0.15) 0%, transparent 60%)"
          : islandState === "music"
          ? "radial-gradient(circle at 50% 10%, rgba(167, 139, 250, 0.15) 0%, transparent 60%)"
          : "radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)"
      }} />

      <div className="di-container">
        {/* Dynamic Island Capsule */}
        <div className="di-island-viewport">
          <div className={`di-island-capsule ${islandState}`}>
            {/* IDLE STATE */}
            {islandState === "idle" && (
              <div className="di-idle-content">
                <div className="di-camera" />
                <div className="di-sensor" />
              </div>
            )}

            {/* SILENT MODE */}
            {islandState === "silent" && (
              <div className="di-silent-content">
                <span className="di-silent-icon">🔔</span>
                <span className="di-silent-text">Silent</span>
                <span className="di-silent-status">On</span>
              </div>
            )}

            {/* FACEID SCANNING */}
            {islandState === "faceid" && (
              <div className="di-faceid-content">
                <div className={`di-faceid-icon ${faceidSuccess ? "success" : "scanning"}`}>
                  {faceidSuccess ? (
                    <svg className="di-check-svg" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg className="di-scan-svg" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <path d="M7 12h10M12 7v10" />
                    </svg>
                  )}
                </div>
                <div className="di-faceid-text">
                  {faceidSuccess ? "FaceID Verified" : "Verifying..."}
                </div>
              </div>
            )}

            {/* INCOMING CALL */}
            {islandState === "call" && (
              <div className="di-call-content">
                <div className="di-call-avatar">
                  <span>JD</span>
                </div>
                <div className="di-call-info">
                  <span className="di-call-name">John Doe</span>
                  <span className="di-call-desc">Mobile</span>
                </div>
                <div className="di-call-actions">
                  <button className="di-call-btn decline" onClick={() => setIslandState("idle")}>
                    📞
                  </button>
                  <button className="di-call-btn accept" onClick={() => setIslandState("idle")}>
                    📞
                  </button>
                </div>
              </div>
            )}

            {/* NOW PLAYING MUSIC */}
            {islandState === "music" && (
              <div className="di-music-content">
                <div className="di-music-art">
                  <div className="di-music-art-inner" />
                </div>
                <div className="di-music-info">
                  <span className="di-music-title">Midnight Signal</span>
                  <span className="di-music-artist">Neon Cascade</span>
                </div>
                <div className="di-music-viz">
                  <div className={`di-viz-bar ${isPlaying ? "active" : ""}`} />
                  <div className={`di-viz-bar ${isPlaying ? "active" : ""}`} />
                  <div className={`di-viz-bar ${isPlaying ? "active" : ""}`} />
                  <div className={`di-viz-bar ${isPlaying ? "active" : ""}`} />
                </div>
                <div className="di-music-controls">
                  <button className="di-music-btn" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trigger Controls Dashboard */}
        <div className="di-dashboard">
          <header className="di-dash-header">
            <h2>Dynamic Island HUD</h2>
            <p>Click any trigger to morph the Dynamic Island capsule. Powered by spring-like fluid CSS physics transitions.</p>
          </header>

          <div className="di-buttons-grid">
            {[
              { id: "silent", label: "Silent Mode 🔔", desc: "Compact Alert" },
              { id: "faceid", label: "FaceID Scan 👤", desc: "Square Morph" },
              { id: "call", label: "Incoming Call 📞", desc: "Horizontal Banner" },
              { id: "music", label: "Now Playing 🎵", desc: "Expanded HUD" },
            ].map((b) => (
              <button
                key={b.id}
                className={`di-dash-btn ${islandState === b.id ? "active" : ""}`}
                onClick={() => triggerState(b.id as IslandState)}
              >
                <span className="di-btn-label">{b.label}</span>
                <span className="di-btn-desc">{b.desc}</span>
              </button>
            ))}
          </div>

          <div className="di-info-footer">
            <span>💡 Click triggers above or tap the Island to exit state.</span>
          </div>
        </div>
      </div>

      <style>{`
        .di-root {
          min-height: calc(100vh - 56px);
          background: #060608;
          color: #f0f0f5;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .di-bg-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          transition: background 0.8s ease;
          pointer-events: none;
        }

        .di-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 60px;
          width: 100%;
          max-width: 600px;
        }

        /* Viewport hosting the island */
        .di-island-viewport {
          height: 180px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
        }

        /* Dynamic Island Capsule */
        .di-island-capsule {
          background: #000000;
          color: #ffffff;
          border-radius: 40px;
          box-shadow: 
            0 25px 50px -12px rgba(0,0,0,0.8),
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 0 0 1px rgba(255,255,255,0.04);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        /* States geometries */
        .di-island-capsule.idle {
          width: 110px;
          height: 30px;
          padding: 0 14px;
        }

        .di-island-capsule.silent {
          width: 150px;
          height: 32px;
          padding: 0 16px;
        }

        .di-island-capsule.faceid {
          width: 140px;
          height: 140px;
          border-radius: 32px;
          flex-direction: column;
          gap: 12px;
        }

        .di-island-capsule.call {
          width: 380px;
          height: 70px;
          padding: 0 16px;
          border-radius: 40px;
        }

        .di-island-capsule.music {
          width: 380px;
          height: 76px;
          padding: 0 18px;
          border-radius: 28px;
        }

        /* Content transitions */
        .di-idle-content,
        .di-silent-content,
        .di-faceid-content,
        .di-call-content,
        .di-music-content {
          display: flex;
          align-items: center;
          width: 100%;
          height: 100%;
          animation: diFadeIn 0.3s ease forwards;
        }

        @keyframes diFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Idle detail */
        .di-idle-content {
          justify-content: space-between;
        }
        .di-camera {
          width: 8px;
          height: 8px;
          background: #0d0d1a;
          border-radius: 50%;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.1);
        }
        .di-sensor {
          width: 5px;
          height: 5px;
          background: #09090e;
          border-radius: 50%;
        }

        /* Silent detail */
        .di-silent-content {
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .di-silent-status {
          color: #ef4444;
        }

        /* FaceID detail */
        .di-faceid-content {
          flex-direction: column;
          justify-content: center;
          gap: 12px;
        }
        .di-faceid-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .di-scan-svg, .di-check-svg {
          width: 100%;
          height: 100%;
        }
        .di-faceid-icon.scanning {
          animation: diScan 1.5s ease-in-out infinite alternate;
        }
        @keyframes diScan {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.08); opacity: 1; }
        }
        .di-faceid-text {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: rgba(255,255,255,0.7);
        }

        /* Call Banner detail */
        .di-call-content {
          justify-content: space-between;
          padding: 0 6px;
        }
        .di-call-avatar {
          width: 40px;
          height: 40px;
          background: #1e293b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .di-call-info {
          flex: 1;
          margin-left: 14px;
          display: flex;
          flex-direction: column;
        }
        .di-call-name {
          font-size: 14px;
          font-weight: 600;
        }
        .di-call-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }
        .di-call-actions {
          display: flex;
          gap: 8px;
        }
        .di-call-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .di-call-btn:hover { transform: scale(1.08); }
        .di-call-btn.decline {
          background: #ef4444;
          color: white;
          transform: rotate(135deg);
        }
        .di-call-btn.accept {
          background: #22c55e;
          color: white;
        }

        /* Music detail */
        .di-music-content {
          justify-content: space-between;
        }
        .di-music-art {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          overflow: hidden;
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .di-music-art-inner {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #a78bfa 0%, #1e1b4b 100%);
        }
        .di-music-info {
          flex: 1;
          margin-left: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .di-music-title {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .di-music-artist {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
        }
        .di-music-viz {
          display: flex;
          gap: 3px;
          align-items: center;
          height: 16px;
          margin-right: 14px;
        }
        .di-viz-bar {
          width: 2px;
          height: 100%;
          background: #a78bfa;
          border-radius: 1px;
        }
        .di-viz-bar.active {
          animation: diVizPulse 0.8s ease-in-out infinite alternate;
        }
        .di-viz-bar:nth-child(1) { animation-delay: 0.1s; }
        .di-viz-bar:nth-child(2) { animation-delay: 0.3s; }
        .di-viz-bar:nth-child(3) { animation-delay: 0.2s; }
        .di-viz-bar:nth-child(4) { animation-delay: 0.4s; }

        @keyframes diVizPulse {
          0% { height: 30%; }
          100% { height: 100%; }
        }
        .di-music-controls {
          display: flex;
          align-items: center;
        }
        .di-music-btn {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .di-music-btn:hover { background: rgba(255,255,255,0.1); }

        /* Dashboard UI */
        .di-dashboard {
          width: 100%;
          background: rgba(12, 12, 16, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .di-dash-header {
          margin-bottom: 24px;
          text-align: center;
        }
        .di-dash-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .di-dash-header p {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
        }

        .di-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .di-dash-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.25s;
        }

        .di-dash-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .di-dash-btn.active {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .di-btn-label {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }

        .di-btn-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }

        .di-info-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}
