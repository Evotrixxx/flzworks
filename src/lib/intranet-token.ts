import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { IntranetModule } from "@/lib/routes";

export const INTRANET_ACCESS_COOKIE = "flz_intranet_access_v2";
export const INTRANET_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 12;

export type IntranetAccessPayload = {
  requestId: string;
  module: IntranetModule;
  exp: number;
};

function getSecret() {
  return process.env.INTRANET_ACCESS_SECRET ?? process.env.AUTH_SECRET ?? "local-dev-flz-intranet-secret-change-before-production";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return createHmac("sha256", getSecret()).update(token).digest("base64url");
}

export function createIntranetAccessToken(
  requestId: string,
  module: IntranetModule,
  maxAgeSeconds = INTRANET_ACCESS_MAX_AGE_SECONDS,
) {
  const payload = Buffer.from(
    JSON.stringify({
      requestId,
      module,
      exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    } satisfies IntranetAccessPayload),
  ).toString("base64url");

  return `${payload}.${signPayload(payload)}`;
}

export function verifyIntranetAccessToken(token: string | undefined): IntranetAccessPayload | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as IntranetAccessPayload;
    if (!parsed.requestId || !parsed.module || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
