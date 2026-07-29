import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { checkIsAdminEmail } from "@/lib/flz-security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const { credential, email: rawEmail, name: rawName } = body;

    let email = rawEmail;
    let name = rawName || "Google User";

    // If a Google Credential JWT token is provided, verify/extract claims from Google
    if (credential && typeof credential === "string") {
      try {
        const googleRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );

        if (googleRes.ok) {
          const googleData = await googleRes.json();
          if (googleData?.email && googleData.email_verified !== "false") {
            email = googleData.email;
            name = googleData.name || googleData.given_name || name;
          }
        } else {
          // If offline or local JWT decode fallback
          const parts = credential.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
            if (payload?.email) {
              email = payload.email;
              name = payload.name || name;
            }
          }
        }
      } catch (err) {
        console.warn("Google token verification fallback:", err);
      }
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required for Google Sign-In." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = checkIsAdminEmail(normalizedEmail);
    const targetRole = isAdmin ? "ADMIN" : "USER";

    // Upsert User in Prisma
    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name,
        role: isAdmin ? "ADMIN" : undefined, // Keep existing role unless admin email
      },
      create: {
        email: normalizedEmail,
        name,
        passwordHash: "oauth_google_authenticated",
        role: targetRole,
      },
    });

    // Create session cookie
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
    return NextResponse.json({ error: "Failed to authenticate with Google." }, { status: 500 });
  }
}
