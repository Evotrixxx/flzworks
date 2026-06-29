"use client";

import { useState } from "react";

export default function ControlCenterPage() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [cellular, setCellular] = useState(false);
  const [airdrop, setAirdrop] = useState(false);

  const [brightness, setBrightness] = useState(65);
  const [volume, setVolume] = useState(45);

  const [isPlaying, setIsPlaying] = useState(false);
  const [focusMode, setFocusMode] = useState("Ne zavarjanak");
  const [focusOpen, setFocusOpen] = useState(false);

  return (
    <div className="cc-root">
      {/* Background glow matching active state */}
      <div className="cc-bg-glow" style={{
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(96, 165, 250, 0.08), transparent 70%)`
      }} />

      <div className="cc-container">
        {/* iOS Control Center Panel */}
        <div className="cc-panel">
          
          {/* Grid of Widgets */}
          <div className="cc-grid">
            
            {/* 1. Connectivity Grid */}
            <div className="cc-widget cc-connectivity">
              <button className={`cc-conn-btn ${wifi ? "active" : ""}`} onClick={() => setWifi(!wifi)}>
                <span className="cc-conn-icon">📶</span>
                <span className="cc-conn-label">Wi-Fi</span>
                <span className="cc-conn-sub">{wifi ? "Connected" : "Off"}</span>
              </button>
              <button className={`cc-conn-btn ${bluetooth ? "active" : ""}`} onClick={() => setBluetooth(!bluetooth)}>
                <span className="cc-conn-icon">🦷</span>
                <span className="cc-conn-label">Bluetooth</span>
                <span className="cc-conn-sub">{bluetooth ? "On" : "Off"}</span>
              </button>
              <button className={`cc-conn-btn ${cellular ? "active" : ""}`} onClick={() => setCellular(!cellular)}>
                <span className="cc-conn-icon">📊</span>
                <span className="cc-conn-label">Cellular</span>
                <span className="cc-conn-sub">{cellular ? "Roaming" : "Off"}</span>
              </button>
              <button className={`cc-conn-btn ${airdrop ? "active" : ""}`} onClick={() => setAirdrop(!airdrop)}>
                <span className="cc-conn-icon">🌀</span>
                <span className="cc-conn-label">AirDrop</span>
                <span className="cc-conn-sub">{airdrop ? "Contacts" : "Off"}</span>
              </button>
            </div>

            {/* 2. Media Controller */}
            <div className="cc-widget cc-media">
              <div className="cc-media-header">
                <div className="cc-media-art" />
                <div className="cc-media-info">
                  <span className="cc-media-title">Glass Horizon</span>
                  <span className="cc-media-artist">Auric Tone</span>
                </div>
              </div>
              <div className="cc-media-controls">
                <button className="cc-media-btn">⏮</button>
                <button className="cc-media-btn play" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button className="cc-media-btn">⏭</button>
              </div>
            </div>

            {/* 3. Screen Mirroring & Focus */}
            <div className="cc-widget-col">
              <button className="cc-widget cc-mirror">
                <span className="cc-mirror-icon">📺</span>
                <span className="cc-mirror-text">Screen Mirroring</span>
              </button>

              <div className="cc-focus-wrapper">
                <button className="cc-widget cc-focus" onClick={() => setFocusOpen(!focusOpen)}>
                  <span className="cc-focus-icon">🌙</span>
                  <span className="cc-focus-text">{focusMode}</span>
                </button>
                
                {focusOpen && (
                  <div className="cc-focus-dropdown">
                    {["Ne zavarjanak", "Munka", "Személyes", "Alvás"].map((mode) => (
                      <button 
                        key={mode} 
                        className={`cc-focus-item ${focusMode === mode ? "active" : ""}`}
                        onClick={() => {
                          setFocusMode(mode);
                          setFocusOpen(false);
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Tactile Sliders */}
            <div className="cc-sliders-group">
              {/* Brightness Vertical Slider */}
              <div className="cc-slider-vertical-wrap">
                <input 
                  type="range" min="0" max="100" value={brightness} 
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="cc-slider-input-hidden"
                />
                <div className="cc-slider-vertical-track">
                  <div className="cc-slider-vertical-fill" style={{ height: `${brightness}%` }} />
                  <div className="cc-slider-vertical-label">
                    <span className="cc-slider-icon">☀️</span>
                    <span className="cc-slider-val">{brightness}%</span>
                  </div>
                </div>
              </div>

              {/* Volume Vertical Slider */}
              <div className="cc-slider-vertical-wrap">
                <input 
                  type="range" min="0" max="100" value={volume} 
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="cc-slider-input-hidden"
                />
                <div className="cc-slider-vertical-track">
                  <div className="cc-slider-vertical-fill" style={{ height: `${volume}%` }} />
                  <div className="cc-slider-vertical-label">
                    <span className="cc-slider-icon">🔊</span>
                    <span className="cc-slider-val">{volume}%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dashboard Title & Meta */}
        <div className="cc-dashboard">
          <header className="cc-dash-header">
            <h2>iOS Control Center</h2>
            <p>A tactile control panel featuring frosted glassmorphism, connectivity toggles, and vertical touch sliders.</p>
          </header>
          <div className="cc-dash-info">
            <span>💡 Drag sliders vertically to adjust Brightness & Volume. Click connectivity buttons to toggle network states.</span>
          </div>
        </div>
      </div>

      <style>{`
        .cc-root {
          min-height: calc(100vh - 56px);
          background: #090b11;
          color: #f0f0f5;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .cc-bg-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .cc-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          width: 100%;
          max-width: 500px;
        }

        /* iOS Control Center Panel */
        .cc-panel {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 36px;
          padding: 24px;
          box-shadow: 
            0 30px 60px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .cc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Generic Widget */
        .cc-widget {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 16px;
          display: flex;
          transition: all 0.25s;
        }

        .cc-widget-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* 1. Connectivity Grid */
        .cc-connectivity {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 12px;
        }
        .cc-conn-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s;
          color: #ffffff;
        }
        .cc-conn-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .cc-conn-btn.active {
          background: #60a5fa;
          border-color: #93c5fd;
          box-shadow: 0 0 15px rgba(96, 165, 250, 0.4);
        }
        .cc-conn-icon {
          font-size: 16px;
          margin-bottom: 6px;
        }
        .cc-conn-label {
          font-size: 11px;
          font-weight: 600;
          display: block;
        }
        .cc-conn-sub {
          font-size: 8px;
          color: rgba(255, 255, 255, 0.45);
          display: block;
          margin-top: 2px;
        }
        .cc-conn-btn.active .cc-conn-sub {
          color: rgba(255, 255, 255, 0.8);
        }

        /* 2. Media Controller */
        .cc-media {
          flex-direction: column;
          gap: 14px;
          justify-content: center;
        }
        .cc-media-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cc-media-art {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #a78bfa, #3b0764);
          border-radius: 8px;
        }
        .cc-media-info {
          display: flex;
          flex-direction: column;
        }
        .cc-media-title {
          font-size: 12px;
          font-weight: 600;
        }
        .cc-media-artist {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }
        .cc-media-controls {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        .cc-media-btn {
          background: none;
          border: none;
          color: white;
          font-size: 14px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .cc-media-btn:hover { background: rgba(255, 255, 255, 0.08); }

        /* 3. Mirroring & Focus */
        .cc-mirror {
          align-items: center;
          gap: 10px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
        }
        .cc-mirror:hover { background: rgba(255, 255, 255, 0.08); }
        .cc-mirror-icon { font-size: 16px; }
        .cc-mirror-text { font-size: 11px; font-weight: 600; }

        .cc-focus-wrapper {
          position: relative;
          width: 100%;
        }
        .cc-focus {
          width: 100%;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
        }
        .cc-focus:hover { background: rgba(255, 255, 255, 0.08); }
        .cc-focus-icon { font-size: 16px; }
        .cc-focus-text { font-size: 11px; font-weight: 600; }

        .cc-focus-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0; right: 0;
          background: rgba(20, 20, 25, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 6px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .cc-focus-item {
          width: 100%;
          background: none;
          border: none;
          padding: 8px 12px;
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .cc-focus-item:hover, .cc-focus-item.active {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        /* 4. Sliders Group */
        .cc-sliders-group {
          display: flex;
          gap: 16px;
        }
        .cc-slider-vertical-wrap {
          flex: 1;
          height: 120px;
          position: relative;
        }
        .cc-slider-input-hidden {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
          transform: rotate(-90deg);
        }
        .cc-slider-vertical-track {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          pointer-events: none;
        }
        .cc-slider-vertical-fill {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          background: rgba(255, 255, 255, 0.25);
          transition: height 0.1s ease-out;
        }
        .cc-slider-vertical-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 14px 6px;
          z-index: 5;
        }
        .cc-slider-icon {
          font-size: 16px;
        }
        .cc-slider-val {
          font-size: 9px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }

        /* Dashboard UI */
        .cc-dashboard {
          width: 100%;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 24px;
          text-align: center;
        }
        .cc-dash-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .cc-dash-header p {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
        }
        .cc-dash-info {
          margin-top: 14px;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
