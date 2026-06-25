import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, title, description, date, visible, category } = body;

    if (!id || !title || !date) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const updated = await prisma.portfolioArticle.update({
      where: { id },
      data: {
        title,
        description,
        date,
        visible: Boolean(visible),
        category: category || "CAR_DESIGN",
      },
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error("Failed to update portfolio article:", error);
    return NextResponse.json({ error: "Failed to update article." }, { status: 500 });
  }
}
