import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { authSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = authSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success || !parsed.data.name) {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
    select: { id: true, email: true, name: true },
  });

  await setSessionCookie(user.id);

  return NextResponse.json({ user });
}
