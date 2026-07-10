import { NextResponse } from "next/server";
import { analyzeMeal } from "@/lib/llm/analyzeMeal";
import { LLMConfigError, LLMRequestError } from "@/lib/llm/client";
import { MEAL_TYPES, type MealType } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: { description?: unknown; mealType?: unknown; lang?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const description =
    typeof payload.description === "string" ? payload.description : "";
  const mealType = (
    typeof payload.mealType === "string" ? payload.mealType : "lunch"
  ) as MealType;
  const lang = payload.lang === "ar" ? "ar" : "en";

  if (!description.trim()) {
    return NextResponse.json(
      { error: "Please describe what you ate." },
      { status: 400 },
    );
  }
  if (!MEAL_TYPES.includes(mealType)) {
    return NextResponse.json({ error: "Invalid meal type." }, { status: 400 });
  }

  try {
    const analysis = await analyzeMeal(description, mealType, lang);
    return NextResponse.json(analysis);
  } catch (err) {
    if (err instanceof LLMConfigError) {
      // Configuration problem — surface clearly so the developer can fix .env.
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof LLMRequestError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("Unexpected analyze error:", err);
    return NextResponse.json(
      { error: "Something went wrong analyzing your meal." },
      { status: 500 },
    );
  }
}
