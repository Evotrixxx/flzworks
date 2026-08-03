"use client";

import { useEffect, useRef, useState } from "react";
import type { TelemetryEventType, TelemetrySite } from "@/lib/telemetry";
import {
  registerTelemetrySender,
  TELEMETRY_CONSENT_KEY,
} from "@/lib/telemetry-client";
import s from "@/components/telemetry-consent.module.css";

type ConsentState = "loading" | "undecided" | "granted" | "denied";

interface TelemetryConsentProps {
  site: TelemetrySite;
}

function postTelemetry(body: Record<string, unknown>, useBeacon = false): Promise<void> {
  const payload = JSON.stringify(body);
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/telemetry", new Blob([payload], { type: "application/json" }));
    return Promise.resolve();
  }

  return fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    cache: "no-store",
    keepalive: true,
  }).then(() => undefined).catch(() => undefined);
}

function TelemetrySession({ site }: { site: TelemetrySite }) {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const sessionId = sessionIdRef.current ?? crypto.randomUUID();
    sessionIdRef.current = sessionId;
    const path = window.location.pathname.slice(0, 120) || "/";
    let activeSince = document.visibilityState === "visible" ? performance.now() : null;
    let accumulatedMs = 0;
    let cancelled = false;
    let unregister: () => void = () => {};

    const durationMs = () => Math.round(
      accumulatedMs + (activeSince === null ? 0 : performance.now() - activeSince),
    );
    const base = () => ({ sessionId, site, path, durationMs: durationMs() });
    const send = (action: "heartbeat" | "end", beacon = false) =>
      postTelemetry({ action, ...base() }, beacon);
    const sendEvent = (eventType: TelemetryEventType, label?: string) => {
      void postTelemetry({ action: "event", ...base(), eventType, ...(label ? { label } : {}) });
    };

    void postTelemetry({ action: "start", ...base() }).then(() => {
      if (cancelled) {
        void send("end", true);
        return;
      }
      unregister = registerTelemetrySender(site, sendEvent);
    });

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === "visible") void send("heartbeat");
    }, 15_000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (activeSince !== null) accumulatedMs += performance.now() - activeSince;
        activeSince = null;
        void send("end", true);
      } else {
        activeSince = performance.now();
        void send("heartbeat");
      }
    };
    const onPageHide = () => {
      if (activeSince !== null) accumulatedMs += performance.now() - activeSince;
      activeSince = null;
      void send("end", true);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      unregister();
      onPageHide();
    };
  }, [site]);

  return null;
}

export function TelemetryConsent({ site }: TelemetryConsentProps) {
  const [consent, setConsent] = useState<ConsentState>("loading");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const globalPrivacyControl = Boolean(
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl,
    );
    const stored = window.localStorage.getItem(TELEMETRY_CONSENT_KEY);
    const next: ConsentState = globalPrivacyControl || navigator.doNotTrack === "1"
      ? "denied"
      : stored === "granted" || stored === "denied"
        ? stored
        : "undecided";
    const timer = window.setTimeout(() => setConsent(next), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const choose = (next: "granted" | "denied") => {
    window.localStorage.setItem(TELEMETRY_CONSENT_KEY, next);
    setConsent(next);
    setSettingsOpen(false);
  };

  if (consent === "loading") return null;

  const showPanel = consent === "undecided" || settingsOpen;
  return (
    <>
      {consent === "granted" && <TelemetrySession site={site} />}

      {showPanel ? (
        <section className={s.panel} role="dialog" aria-label="Analytics privacy settings">
          <div className={s.eyebrow}>Privacy-friendly analytics</div>
          <h2 className={s.title}>May FLZ Works measure this visit?</h2>
          <p className={s.copy}>
            With your permission, this site records first-party visit duration and aggregate social
            and vCard interactions. It uses no analytics cookies, advertising profiles, IP storage,
            user-agent storage, referrers, or cross-site tracking. Raw visit data is kept for up to 90 days.
          </p>
          <p className={s.meta}>
            Controller: FLZ Works / Bence Flosz · hi@flz.works. Purpose: improve the portfolio.
            Legal basis: your consent. Data is not shared with third parties, and you can withdraw here at any time.
          </p>
          <div className={s.actions}>
            <button type="button" className={s.accept} onClick={() => choose("granted")}>
              Allow analytics
            </button>
            <button type="button" className={s.decline} onClick={() => choose("denied")}>
              {consent === "granted" ? "Turn off analytics" : "Decline"}
            </button>
          </div>
          {consent !== "undecided" && (
            <button type="button" className={s.close} onClick={() => setSettingsOpen(false)} aria-label="Close privacy settings">
              Close
            </button>
          )}
        </section>
      ) : (
        <button type="button" className={s.privacyButton} onClick={() => setSettingsOpen(true)}>
          Privacy · analytics {consent === "granted" ? "on" : "off"}
        </button>
      )}
    </>
  );
}
