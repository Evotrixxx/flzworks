import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session-token";

describe("session token", () => {
  it("round-trips a signed user id", () => {
    const token = createSessionToken("user-1", 60);

    expect(verifySessionToken(token)?.userId).toBe("user-1");
  });

  it("rejects tampered tokens", () => {
    const token = createSessionToken("user-1", 60);
    const [, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        userId: "admin",
        exp: Math.floor(Date.now() / 1000) + 60,
      }),
    ).toString("base64url");

    expect(verifySessionToken(`${tamperedPayload}.${signature}`)).toBeNull();
  });
});
