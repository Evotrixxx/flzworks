import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { locale?: unknown } | null;

  if (!isLocale(body?.locale)) {
    return NextResponse.json({ error: "Invalid locale." }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("autopiac_lang", body.locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}
