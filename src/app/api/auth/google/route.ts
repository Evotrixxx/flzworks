import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { checkIsAdminEmail } from "@/lib/flz-security";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export async function POST(request: NextRequest) {
  if (!client || !GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Google Sign-In is not configured on this server." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body?.credential || typeof body.credential !== "string") {
      return NextResponse.json(
        { error: "A Google credential token is required." },
        { status: 400 },
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: body.credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return NextResponse.json(
        { error: "Google account email is not verified." },
        { status: 401 },
      );
    }

    const email = payload.email.trim().toLowerCase();
    const name = payload.name || payload.given_name || "Google User";
    const isAdmin = checkIsAdminEmail(email);
    const targetRole = isAdmin ? "ADMIN" : "USER";

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        role: isAdmin ? "ADMIN" : undefined,
      },
      create: {
        email,
        name,
        passwordHash: "oauth_google_authenticated",
        role: targetRole,
      },
    });

    await setSessionCookie(user.id);

    const redirectPath = user.role === "ADMIN" || isAdmin ? "/studio" : "/dashboard";

    return NextResponse.json({
      success: true,
      message: `Signed in successfully as ${user.email}`,
      redirect: redirectPath,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google Auth API Error:", error);
    return NextResponse.json(
      { error: "Google token verification failed." },
      { status: 401 },
    );
  }
}
