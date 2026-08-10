import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminUser } from "@/lib/flz-security";

export async function GET() {
  const auth = await verifyAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const messages = await prisma.flzContactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch FLZ messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
