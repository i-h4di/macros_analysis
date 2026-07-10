import { chatCompletion, LLMRequestError, type ChatMessage } from "./client";
import { MealAnalysisSchema, type MealAnalysis } from "@/lib/types";
import { MEAL_TYPE_LABELS, type MealType } from "@/lib/constants";

const SYSTEM_PROMPT = `You are a nutrition estimation engine for a meal-tracking app called Sa'arati.
The user describes a meal in plain text — in Arabic or English (for example "شاورما دجاج" or "grilled chicken and rice").
Estimate the nutrition of that meal for a single typical serving.

Respond with a STRICT JSON object ONLY (no markdown, no code fences, no extra prose) with exactly these keys:
{
  "mealName": string,        // short, clean name for the meal in the same language the user used
  "items": string[],         // the individual foods you identified (1-6 items)
  "calories": number,        // integer kcal for the whole meal
  "protein": number,         // grams
  "carbs": number,           // grams
  "fat": number,             // grams
  "fiber": number,           // grams
  "insight": string          // one short, friendly health note (<= 200 chars), in the same language as the description
}

Rules:
- Give realistic best-effort estimates for common foods and portion sizes.
- All numbers must be plain numbers (no units, no ranges). Use 0 if genuinely none.
- Never leave a field out. Never wrap the JSON in anything.`;

export async function analyzeMeal(
  description: string,
  mealType: MealType,
  lang: "ar" | "en" = "en",
): Promise<MealAnalysis> {
  const trimmed = description.trim();
  if (!trimmed) {
    throw new LLMRequestError("Please describe what you ate.");
  }

  const langName = lang === "ar" ? "Arabic" : "English";
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Meal type: ${MEAL_TYPE_LABELS[mealType]}\nUI language: ${langName} — write mealName, items, and insight in ${langName}.\nDescription: ${trimmed}`,
    },
  ];

  const raw = await chatCompletion(messages);
  const parsed = parseAnalysis(raw);
  return parsed;
}

// Providers occasionally wrap JSON in code fences or prose despite instructions;
// extract the first JSON object defensively before validating.
function parseAnalysis(raw: string): MealAnalysis {
  let jsonText = raw.trim();

  // Strip ```json ... ``` fences if present.
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  } else {
    const first = jsonText.indexOf("{");
    const last = jsonText.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      jsonText = jsonText.slice(first, last + 1);
    }
  }

  let obj: unknown;
  try {
    obj = JSON.parse(jsonText);
  } catch {
    throw new LLMRequestError(
      "The AI returned an unexpected response. Please try again.",
    );
  }

  const result = MealAnalysisSchema.safeParse(obj);
  if (!result.success) {
    throw new LLMRequestError(
      "The AI response was missing some nutrition fields. Please try again.",
    );
  }

  // Round to sensible precision.
  const a = result.data;
  return {
    ...a,
    calories: Math.round(a.calories),
    protein: round1(a.protein),
    carbs: round1(a.carbs),
    fat: round1(a.fat),
    fiber: round1(a.fiber),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
