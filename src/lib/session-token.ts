import { createHmac, timingSafeEqual } from "crypto";

export type SessionPayload = {
  userId: string;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET ?? "local-dev-autopiac-secret-change-before-production";
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string, maxAgeSeconds: number) {
  const payload = toBase64Url(
    JSON.stringify({
      userId,
      exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    } satisfies SessionPayload),
  );
  return `${payload}.${signPayload(payload)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
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

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionPayload;

    if (!parsed.userId || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
