import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// DELETE /api/meals/:id -> remove a logged meal.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.meal.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json({ error: "Meal not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
