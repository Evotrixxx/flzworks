"use client";

import { useState, useEffect } from "react";

export default function WidgetSpacePage() {
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [watchLevel, setWatchLevel] = useState(64);
  const [podsLevel, setPodsLevel] = useState(100);

  const [fitMove, setFitMove] = useState(380); // Goal: 500
  const [fitExercise, setFitExercise] = useState(22); // Goal: 30
  const [fitStand, setFitStand] = useState(8); // Goal: 12

  // Simulate fitness progress slowly
  useEffect(() => {
    const timer = setTimeout(() => {
      setFitMove((m) => Math.min(m + 15, 480));
      setFitExercise((e) => Math.min(e + 2, 28));
      setFitStand((s) => Math.min(s + 1, 10));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ws-root">
      {/* Dynamic colorful iOS wallpaper background */}
      <div className="ws-wallpaper">
        <div className="ws-orb ws-orb-1" />
        <div className="ws-orb ws-orb-2" />
        <div className="ws-orb ws-orb-3" />
      </div>

      <div className="ws-container">
        {/* Main widgets grid representing iOS home screen */}
        <div className="ws-grid">

          {/* 1. WEATHER WIDGET (Medium size widget) */}
          <div className="ws-widget ws-weather">
            <div className="ws-weather-main">
              <div>
                <h3 className="ws-weather-city">Budapest</h3>
                <span className="ws-weather-temp">24°</span>
              </div>
              <div className="ws-weather-icon">☀️</div>
            </div>
            <div className="ws-weather-info">
              <span>Napos</span>
              <span>Magas: 26°  Alacsony: 14°</span>
            </div>
            <div className="ws-weather-forecast">
              {["Hé", "Ke", "Sze", "Csü", "Pé"].map((day, i) => (
                <div key={day} className="ws-forecast-day">
                  <span>{day}</span>
                  <span>{["☀️", "🌤️", "⛅", "🌧️", "☀️"][i]}</span>
                  <span>{[25, 24, 22, 19, 23][i]}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. FITNESS WIDGET (Small size widget) */}
          <div className="ws-widget ws-fitness">
            <div className="ws-fitness-header">
              <span className="ws-fit-title">Tevékenység</span>
            </div>
            <div className="ws-fitness-content">
              <div className="ws-rings-container">
                {/* Concentric rings */}
                <svg className="ws-rings-svg" viewBox="0 0 100 100">
                  {/* Outer Ring (Red/Move) */}
                  <circle className="ws-ring-bg" cx="50" cy="50" r="40" />
                  <circle 
                    className="ws-ring-fill move" cx="50" cy="50" r="40" 
                    style={{ strokeDashoffset: 251.2 - (251.2 * (fitMove / 500)) }}
                  />

                  {/* Middle Ring (Green/Exercise) */}
                  <circle className="ws-ring-bg" cx="50" cy="50" r="30" />
                  <circle 
                    className="ws-ring-fill exercise" cx="50" cy="50" r="30"
                    style={{ strokeDashoffset: 188.4 - (188.4 * (fitExercise / 30)) }}
                  />

                  {/* Inner Ring (Blue/Stand) */}
                  <circle className="ws-ring-bg" cx="50" cy="50" r="20" />
                  <circle 
                    className="ws-ring-fill stand" cx="50" cy="50" r="20"
                    style={{ strokeDashoffset: 125.6 - (125.6 * (fitStand / 12)) }}
                  />
                </svg>
              </div>
              <div className="ws-fitness-stats">
                <div className="ws-stat move">
                  <span>Mozgás</span>
                  <strong>{fitMove}/500 kcal</strong>
                </div>
                <div className="ws-stat exercise">
                  <span>Edzés</span>
                  <strong>{fitExercise}/30 perc</strong>
                </div>
                <div className="ws-stat stand">
                  <span>Állás</span>
                  <strong>{fitStand}/12 óra</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. BATTERY STATUS WIDGET (Medium size widget) */}
          <div className="ws-widget ws-battery">
            <h3 className="ws-widget-title">Akkumulátor</h3>
            <div className="ws-battery-grid">
              {[
                { name: "iPhone", level: batteryLevel, color: "#22c55e", icon: "📱" },
                { name: "Apple Watch", level: watchLevel, color: "#3b82f6", icon: "⌚" },
                { name: "AirPods", level: podsLevel, color: "#a855f7", icon: "🎧" },
                { name: "iPad", level: 92, color: "#eab308", icon: "💻" }
              ].map((dev) => (
                <div key={dev.name} className="ws-battery-item">
                  <div className="ws-bat-ring-wrap">
                    <svg className="ws-bat-ring-svg" viewBox="0 0 44 44">
                      <circle className="ws-bat-ring-bg" cx="22" cy="22" r="18" />
                      <circle 
                        className="ws-bat-ring-fill" cx="22" cy="22" r="18" 
                        stroke={dev.color}
                        style={{ strokeDashoffset: 113 - (113 * (dev.level / 100)) }}
                      />
                    </svg>
                    <span className="ws-bat-icon">{dev.icon}</span>
                  </div>
                  <span className="ws-bat-name">{dev.name}</span>
                  <span className="ws-bat-level">{dev.level}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CALENDAR WIDGET (Small size widget) */}
          <div className="ws-widget ws-calendar">
            <div className="ws-cal-header">
              <span className="ws-cal-month">HÉTFŐ</span>
              <span className="ws-cal-day">29</span>
            </div>
            <div className="ws-cal-events">
              <div className="ws-event">
                <span className="ws-event-time">10:00</span>
                <span className="ws-event-title">Design Review</span>
              </div>
              <div className="ws-event">
                <span className="ws-event-time">14:30</span>
                <span className="ws-event-title">WebDev Sync</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Title & Meta */}
        <div className="ws-dashboard">
          <header className="ws-dash-header">
            <h2>iOS Widget Space</h2>
            <p>A modular home screen dashboard featuring interactive iOS-style weather, fitness rings, calendar events, and battery level widgets.</p>
          </header>
        </div>
      </div>

      <style>{`
        .ws-root {
          min-height: calc(100vh - 56px);
          background: #000000;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        /* iOS abstract wallpaper */
        .ws-wallpaper {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        }
        .ws-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.35;
        }
        .ws-orb-1 {
          width: 600px;
          height: 600px;
          background: #ec4899;
          top: -200px;
          left: -100px;
          animation: wsFloat1 15s ease-in-out infinite alternate;
        }
        .ws-orb-2 {
          width: 500px;
          height: 500px;
          background: #3b82f6;
          bottom: -150px;
          right: -100px;
          animation: wsFloat2 12s ease-in-out infinite alternate;
        }
        .ws-orb-3 {
          width: 400px;
          height: 400px;
          background: #8b5cf6;
          top: 30%;
          left: 40%;
          opacity: 0.2;
        }

        @keyframes wsFloat1 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(60px) scale(1.1); }
        }
        @keyframes wsFloat2 {
          0% { transform: translateY(0) scale(1.1); }
          100% { transform: translateY(-80px) scale(0.9); }
        }

        .ws-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          width: 100%;
          max-width: 740px;
        }

        /* Home screen widgets grid */
        .ws-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .ws-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Widget base style */
        .ws-widget {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 22px;
          box-shadow: 
            0 15px 35px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 160px;
        }

        .ws-widget-title {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        /* 1. Weather Widget */
        .ws-weather {
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.12), rgba(255,255,255,0.03));
          min-height: 180px;
        }
        .ws-weather-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .ws-weather-city {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .ws-weather-temp {
          font-size: 36px;
          font-weight: 300;
          line-height: 1;
        }
        .ws-weather-icon {
          font-size: 28px;
        }
        .ws-weather-info {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ws-weather-forecast {
          display: flex;
          justify-content: space-between;
          margin-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 10px;
        }
        .ws-forecast-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 10px;
          gap: 4px;
        }
        .ws-forecast-day span:first-child {
          color: rgba(255,255,255,0.4);
        }
        .ws-forecast-day span:last-child {
          font-weight: 600;
        }

        /* 2. Fitness Widget */
        .ws-fitness {
          min-height: 180px;
        }
        .ws-fitness-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .ws-fit-title {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ws-fitness-content {
          display: flex;
          align-items: center;
          gap: 18px;
          flex: 1;
        }
        .ws-rings-container {
          width: 80px;
          height: 80px;
        }
        .ws-rings-svg {
          width: 100%;
          height: 100%;
        }
        .ws-ring-bg {
          fill: none;
          stroke: rgba(255,255,255,0.03);
          stroke-width: 8;
        }
        .ws-ring-fill {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transform: rotate(-90deg);
          transform-origin: 50px 50px;
          transition: stroke-dashoffset 1s ease-out;
        }
        .ws-ring-fill.move {
          stroke: #ff2d55;
          stroke-dasharray: 251.2;
        }
        .ws-ring-fill.exercise {
          stroke: #04d361;
          stroke-dasharray: 188.4;
        }
        .ws-ring-fill.stand {
          stroke: #00bcd4;
          stroke-dasharray: 125.6;
        }
        .ws-fitness-stats {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ws-stat {
          display: flex;
          flex-direction: column;
          font-size: 10px;
        }
        .ws-stat span {
          font-size: 9px;
          text-transform: uppercase;
        }
        .ws-stat.move span { color: #ff2d55; }
        .ws-stat.exercise span { color: #04d361; }
        .ws-stat.stand span { color: #00bcd4; }
        .ws-stat strong {
          font-size: 11px;
          color: #ffffff;
        }

        /* 3. Battery Widget */
        .ws-battery {
          justify-content: flex-start;
        }
        .ws-battery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          flex: 1;
          align-items: center;
        }
        .ws-battery-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .ws-bat-ring-wrap {
          position: relative;
          width: 44px;
          height: 44px;
        }
        .ws-bat-ring-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .ws-bat-ring-bg {
          fill: none;
          stroke: rgba(255,255,255,0.04);
          stroke-width: 3;
        }
        .ws-bat-ring-fill {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 113;
          transition: stroke-dashoffset 1s ease-out;
        }
        .ws-bat-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        .ws-bat-name {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }
        .ws-bat-level {
          font-size: 11px;
          font-weight: 600;
        }

        /* 4. Calendar Widget */
        .ws-calendar {
          background: linear-gradient(145deg, rgba(239, 68, 68, 0.08), rgba(255,255,255,0.03));
        }
        .ws-cal-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .ws-cal-month {
          font-size: 9px;
          font-weight: 700;
          color: #ff3b30;
          letter-spacing: 1px;
        }
        .ws-cal-day {
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
          color: #ffffff;
        }
        .ws-cal-events {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ws-event {
          display: flex;
          flex-direction: column;
          border-left: 2px solid #ff3b30;
          padding-left: 8px;
        }
        .ws-event-time {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
        }
        .ws-event-title {
          font-size: 11px;
          font-weight: 600;
        }

        /* Dashboard HUD */
        .ws-dashboard {
          width: 100%;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 24px;
          text-align: center;
        }
        .ws-dash-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 6px;
        }
        .ws-dash-header p {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
