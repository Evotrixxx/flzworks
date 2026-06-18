import "server-only";

import { cookies, headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTOPIAC_BASE_PATH } from "@/lib/routes";
import {
  INTRANET_ACCESS_COOKIE,
  INTRANET_ACCESS_MAX_AGE_SECONDS,
  createIntranetAccessToken,
  verifyIntranetAccessToken,
} from "@/lib/intranet-token";

export type IntranetGateState =
  | { status: "allowed" }
  | { status: "blocked"; expiresAt: Date }
  | { status: "approved-unclaimed" }
  | { status: "needs-request" };

export function getClientIpFromHeaders(headerSource: Headers) {
  const forwarded = headerSource.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    headerSource.get("cf-connecting-ip") ||
    headerSource.get("x-real-ip") ||
    forwarded ||
    "unknown"
  );
}

export async function hasValidIntranetCookie(cookieValue?: string) {
  const payload = verifyIntranetAccessToken(cookieValue);
  if (!payload) {
    return false;
  }

  const request = await prisma.intranetAccessRequest.findFirst({
    where: {
      id: payload.requestId,
      status: "APPROVED",
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  return Boolean(request);
}

export async function getIntranetGateState(): Promise<IntranetGateState> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const ipAddress = getClientIpFromHeaders(headerStore);

  if (await hasValidIntranetCookie(cookieStore.get(INTRANET_ACCESS_COOKIE)?.value)) {
    return { status: "allowed" };
  }

  const block = await prisma.intranetIpBlock.findFirst({
    where: {
      ipAddress,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { expiresAt: true },
  });

  if (block) {
    return { status: "blocked", expiresAt: block.expiresAt };
  }

  const approved = await prisma.intranetAccessRequest.findFirst({
    where: {
      ipAddress,
      status: "APPROVED",
      accessedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { approvedAt: "desc" },
    select: { id: true },
  });

  if (approved) {
    return { status: "approved-unclaimed" };
  }

  return { status: "needs-request" };
}

export async function createIntranetAccessResponse(ipAddress: string, requestUrl: string) {
  const approved = await prisma.intranetAccessRequest.findFirst({
    where: {
      ipAddress,
      status: "APPROVED",
      accessedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { approvedAt: "desc" },
    select: { id: true },
  });

  if (!approved) {
    return NextResponse.redirect(new URL(`${AUTOPIAC_BASE_PATH}/request`, requestUrl));
  }

  await prisma.intranetAccessRequest.update({
    where: { id: approved.id },
    data: { accessedAt: new Date() },
  });

  const response = NextResponse.redirect(new URL(AUTOPIAC_BASE_PATH, requestUrl));
  response.cookies.set(INTRANET_ACCESS_COOKIE, createIntranetAccessToken(approved.id), {
    httpOnly: true,
    maxAge: INTRANET_ACCESS_MAX_AGE_SECONDS,
    path: AUTOPIAC_BASE_PATH,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function requireIntranetApiAccess(request: NextRequest) {
  const ipAddress = getClientIpFromHeaders(request.headers);

  const block = await prisma.intranetIpBlock.findFirst({
    where: {
      ipAddress,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (block) {
    return NextResponse.json({ error: "Intranet access is blocked for this IP." }, { status: 403 });
  }

  const allowed = await hasValidIntranetCookie(request.cookies.get(INTRANET_ACCESS_COOKIE)?.value);
  if (!allowed) {
    return NextResponse.json({ error: "Intranet access required." }, { status: 403 });
  }

  return null;
}
