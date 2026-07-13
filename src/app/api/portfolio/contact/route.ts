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

    const result = await sendContactEmail({
      name: name?.slice(0, 100),
      email: email?.slice(0, 100),
      message: message?.slice(0, 5000),
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
