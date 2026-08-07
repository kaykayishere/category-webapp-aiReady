import { NextResponse } from "next/server";
import { getLanguageIndex } from "@/lib/languages";

/**
 * GET /api/languages
 *
 * The cross-source language index: one row per language with the ids of the
 * sources that cover it. Exists so the parent portal can ask this category
 * "what do you have for this language?" without reading this app's /data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ languages: getLanguageIndex() });
}
