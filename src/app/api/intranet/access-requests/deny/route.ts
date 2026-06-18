import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOpaqueToken } from "@/lib/intranet-token";
import { intranetActionTokenSchema } from "@/lib/validation";

const DENY_BLOCK_MS = 1000 * 60 * 60 * 24 * 30;

function htmlResponse(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#030303;color:#fff;font-family:Arial,sans-serif}.card{max-width:560px;margin:24px;padding:28px;border:1px solid rgba(255,255,255,.16);border-radius:28px;background:rgba(255,255,255,.07);box-shadow:0 24px 80px rgba(0,0,0,.5);backdrop-filter:blur(24px)}p{color:#c7c7c7;line-height:1.6}</style></head><body><main class="card"><h1>${title}</h1><p>${body}</p></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  const parsed = intranetActionTokenSchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
  });

  if (!parsed.success) {
    return htmlResponse("Invalid access action", "The denial token is missing or invalid.", 400);
  }

  const tokenHash = hashOpaqueToken(parsed.data.token);
  const accessRequest = await prisma.intranetAccessRequest.findUnique({
    where: { denyTokenHash: tokenHash },
  });

  if (!accessRequest || accessRequest.status !== "PENDING" || accessRequest.expiresAt < new Date()) {
    return htmlResponse("Denial unavailable", "This denial link is expired, invalid, or already used.", 410);
  }

  await prisma.$transaction([
    prisma.intranetAccessRequest.update({
      where: { id: accessRequest.id },
      data: {
        status: "DENIED",
        deniedAt: new Date(),
      },
    }),
    prisma.intranetIpBlock.create({
      data: {
        ipAddress: accessRequest.ipAddress,
        reason: `Denied access request from ${accessRequest.email}`,
        expiresAt: new Date(Date.now() + DENY_BLOCK_MS),
      },
    }),
  ]);

  return htmlResponse(
    "AutoPiac access denied",
    "The requester IP has been blocked for 30 days.",
  );
}
