import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Validate the email format server-side when one is provided (client checks
    // can be bypassed) so we don't send back replies to malformed addresses.
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const result = await sendContactEmail({
      name: typeof name === "string" ? name.trim().slice(0, 100) : undefined,
      email: trimmedEmail ? trimmedEmail.slice(0, 100) : undefined,
      message: message.slice(0, 5000),
    });

    return NextResponse.json({ success: true, sent: result.sent });
  } catch (error: any) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
