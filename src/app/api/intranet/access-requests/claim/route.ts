import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOpaqueToken } from "@/lib/intranet-token";
import { intranetActionTokenSchema } from "@/lib/validation";
import { setIntranetAccessCookie } from "@/lib/intranet";
import { AUTOPIAC_BASE_PATH, GUIDE_PROTOTYPE_BASE_PATH, type IntranetModule } from "@/lib/routes";

function htmlResponse(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#030303;color:#fff;font-family:Arial,sans-serif}.card{max-width:560px;margin:24px;padding:28px;border:1px solid rgba(255,255,255,.16);border-radius:28px;background:rgba(255,255,255,.07);box-shadow:0 24px 80px rgba(0,0,0,.5);backdrop-filter:blur(24px)}p{color:#c7c7c7;line-height:1.6}a{color:#fff}</style></head><body><main class="card"><h1>${title}</h1><p>${body}</p></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  const parsed = intranetActionTokenSchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
  });

  if (!parsed.success) {
    return htmlResponse("Invalid access link", "The magic link is missing or invalid.", 400);
  }

  const tokenHash = hashOpaqueToken(parsed.data.token);
  const accessRequest = await prisma.intranetAccessRequest.findUnique({
    where: { claimTokenHash: tokenHash },
  });

  if (!accessRequest || accessRequest.status !== "APPROVED" || accessRequest.expiresAt < new Date()) {
    return htmlResponse("Access link expired", "This access link is expired or invalid. Please request access again.", 410);
  }

  if (accessRequest.accessedAt) {
    return htmlResponse("Link already used", "This access link has already been used. Please request access again if you need to log in from a new device.", 410);
  }

  const claimedRequest = await prisma.intranetAccessRequest.update({
    where: { id: accessRequest.id },
    data: {
      accessedAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour access limit from the moment of claim
    },
    select: { id: true },
  });

  const redirectPath = accessRequest.module === "guide_prototype" ? GUIDE_PROTOTYPE_BASE_PATH : AUTOPIAC_BASE_PATH;
  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  setIntranetAccessCookie(response, claimedRequest.id, accessRequest.module as IntranetModule);
  return response;
}
