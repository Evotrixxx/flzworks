import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { name, email, message, source } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Client-side checks can be bypassed, so validate optional reply addresses here too.
    const trimmedEmail = typeof email === "string" ? email.trim() : "";
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const saved = await prisma.flzContactMessage.create({
      data: {
        name: typeof name === "string" ? name.trim().slice(0, 100) : undefined,
        email: trimmedEmail ? trimmedEmail.slice(0, 100) : undefined,
        message: message.trim().slice(0, 5000),
        source: source === "main" || source === "autosalon" ? source : "portfolio",
      },
    });

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return NextResponse.json(
      { error: "Could not save message" },
      { status: 500 }
    );
  }
}
