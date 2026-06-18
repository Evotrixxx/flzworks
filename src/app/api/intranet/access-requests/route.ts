import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIpFromHeaders } from "@/lib/intranet";
import { createOpaqueToken, hashOpaqueToken } from "@/lib/intranet-token";
import { sendAccessRequestEmail } from "@/lib/mailer";
import { intranetAccessRequestSchema } from "@/lib/validation";

const REQUEST_TTL_MS = 1000 * 60 * 60 * 24;

function getAppBaseUrl(request: NextRequest) {
  return process.env.APP_BASE_URL || request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const parsed = intranetAccessRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name and email." }, { status: 400 });
  }

  const ipAddress = getClientIpFromHeaders(request.headers);
  const activeBlock = await prisma.intranetIpBlock.findFirst({
    where: {
      ipAddress,
      expiresAt: { gt: new Date() },
    },
    select: { expiresAt: true },
  });

  if (activeBlock) {
    return NextResponse.json({ error: "Access from this IP is blocked." }, { status: 403 });
  }

  const approveToken = createOpaqueToken();
  const denyToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + REQUEST_TTL_MS);

  await prisma.intranetAccessRequest.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      ipAddress,
      approveTokenHash: hashOpaqueToken(approveToken),
      denyTokenHash: hashOpaqueToken(denyToken),
      expiresAt,
    },
  });

  const baseUrl = getAppBaseUrl(request);
  const approveUrl = `${baseUrl}/api/intranet/access-requests/approve?token=${approveToken}`;
  const denyUrl = `${baseUrl}/api/intranet/access-requests/deny?token=${denyToken}`;

  const emailResult = await sendAccessRequestEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    ipAddress,
    approveUrl,
    denyUrl,
  });

  return NextResponse.json({
    message: emailResult.sent
      ? "Request sent. Return to this page after the host approves it."
      : "Request stored. SMTP is not configured, so the approval links were logged in the server console.",
  });
}
