import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeMeal } from "@/lib/meals";

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

const UpdateMealSchema = z
  .object({
    name: z.string().min(1),
    calories: z.number().int().nonnegative(),
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
    fiber: z.number().nonnegative(),
  })
  .partial();

// PATCH /api/meals/:id -> update name/macros of a logged meal.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = UpdateMealSchema.safeParse(payload);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Invalid meal data." }, { status: 400 });
  }

  try {
    const meal = await prisma.meal.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(serializeMeal(meal));
  } catch {
    return NextResponse.json({ error: "Meal not found." }, { status: 404 });
  }
}
