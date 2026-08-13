import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashOpaqueToken, createOpaqueToken } from "@/lib/intranet-token";
import { ALLOWED_INTRANET_MODULES, type IntranetModule } from "@/lib/routes";
import { intranetActionTokenSchema } from "@/lib/validation";

function htmlResponse(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#030303;color:#fff;font-family:Arial,sans-serif}.card{max-width:560px;margin:24px;padding:28px;border:1px solid rgba(255,255,255,.16);border-radius:28px;background:rgba(255,255,255,.07);box-shadow:0 24px 80px rgba(0,0,0,.5);backdrop-filter:blur(24px)}p{color:#c7c7c7;line-height:1.6}form{margin-top:20px}button{cursor:pointer;padding:12px 20px;border-radius:999px;border:none;background:#111827;color:#fff;font-weight:bold;font-size:15px}button:hover{background:#1f2937}</style></head><body><main class="card"><h1>${title}</h1><p>${body}</p></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function confirmResponse(token: string, name: string, email: string, duration: string | null) {
  const durationField = duration
    ? `<input type="hidden" name="duration" value="${duration}">`
    : "";
  const label =
    duration === "30" ? "30 days" : duration === "365" ? "1 year" : "single 1-hour session";

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Confirm access approval</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#030303;color:#fff;font-family:Arial,sans-serif}.card{max-width:560px;margin:24px;padding:28px;border:1px solid rgba(255,255,255,.16);border-radius:28px;background:rgba(255,255,255,.07);box-shadow:0 24px 80px rgba(0,0,0,.5);backdrop-filter:blur(24px)}p{color:#c7c7c7;line-height:1.6}form{margin-top:20px}button{cursor:pointer;padding:12px 20px;border-radius:999px;border:none;background:#111827;color:#fff;font-weight:bold;font-size:15px}button:hover{background:#1f2937}</style></head><body><main class="card"><h1>Confirm access approval</h1><p>Approve intranet access for <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}), granting a ${label}?</p><form method="POST"><input type="hidden" name="token" value="${escapeHtml(token)}">${durationField}<button type="submit">Approve access</button></form></main></body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// GET renders a confirmation page only — it must not mutate state, since
// mail gateways and link scanners routinely prefetch URLs found in emails.
export async function GET(request: NextRequest) {
  const parsed = intranetActionTokenSchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
  });

  if (!parsed.success) {
    return htmlResponse("Invalid access action", "The approval token is missing or invalid.", 400);
  }

  const durationStr = request.nextUrl.searchParams.get("duration");

  const tokenHash = hashOpaqueToken(parsed.data.token);
  const accessRequest = await prisma.intranetAccessRequest.findUnique({
    where: { approveTokenHash: tokenHash },
  });

  if (!accessRequest || accessRequest.status !== "PENDING" || accessRequest.expiresAt < new Date()) {
    return htmlResponse("Approval unavailable", "This approval link is expired, invalid, or already used.", 410);
  }

  return confirmResponse(parsed.data.token, accessRequest.name, accessRequest.email, durationStr);
}

// The actual approval only happens on this explicit, user-initiated POST.
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const parsed = intranetActionTokenSchema.safeParse({
    token: formData?.get("token"),
  });

  if (!parsed.success) {
    return htmlResponse("Invalid access action", "The approval token is missing or invalid.", 400);
  }

  const durationStr = formData?.get("duration");
  const grantedDurationDays =
    typeof durationStr === "string" && !isNaN(Number(durationStr)) ? Number(durationStr) : null;

  const tokenHash = hashOpaqueToken(parsed.data.token);
  const accessRequest = await prisma.intranetAccessRequest.findUnique({
    where: { approveTokenHash: tokenHash },
  });

  if (!accessRequest || accessRequest.status !== "PENDING" || accessRequest.expiresAt < new Date()) {
    return htmlResponse("Approval unavailable", "This approval link is expired, invalid, or already used.", 410);
  }

  if (!ALLOWED_INTRANET_MODULES.includes(accessRequest.module as IntranetModule)) {
    return htmlResponse("Approval unavailable", "This approval link targets an unsupported intranet module.", 400);
  }

  const claimToken = createOpaqueToken();

  await prisma.intranetAccessRequest.update({
    where: { id: accessRequest.id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      claimTokenHash: hashOpaqueToken(claimToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours to claim the magic link
      grantedDurationDays,
    },
    select: { id: true },
  });

  const baseUrl = process.env.APP_BASE_URL || request.nextUrl.origin;
  const claimUrl = `${baseUrl}/api/intranet/access-requests/claim?token=${claimToken}`;

  const { sendMagicLinkEmail } = await import("@/lib/mailer");

  try {
    await sendMagicLinkEmail(accessRequest.email, accessRequest.name, claimUrl, accessRequest.module);
  } catch (error) {
    console.error("Magic link email failed.", error);
    return htmlResponse(
      "Approval successful, but email failed",
      "The request was approved, but the system failed to email the magic link to the requester.",
      503
    );
  }

  return htmlResponse(
    "Access Request Approved",
    `You have successfully approved the request for ${escapeHtml(accessRequest.name)} (${escapeHtml(accessRequest.email)}). They have been sent a secure login link.`,
    200
  );
}
