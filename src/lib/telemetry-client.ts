import type { TelemetryEventType, TelemetrySite } from "@/lib/telemetry";

type TelemetrySender = (type: TelemetryEventType, label?: string) => void;

let activeSender: { site: TelemetrySite; send: TelemetrySender } | null = null;

export const TELEMETRY_CONSENT_KEY = "flz.telemetry.consent";
export const TELEMETRY_READY_EVENT = "flz-telemetry-ready";

export function trackTelemetryEvent(
  type: TelemetryEventType,
  site: TelemetrySite,
  label?: string,
): void {
  if (activeSender?.site === site) {
    activeSender.send(type, label);
  }
}

export function registerTelemetrySender(site: TelemetrySite, send: TelemetrySender): () => void {
  activeSender = { site, send };
  window.dispatchEvent(new CustomEvent(TELEMETRY_READY_EVENT, { detail: { site } }));

  return () => {
    if (activeSender?.send === send) activeSender = null;
  };
}
