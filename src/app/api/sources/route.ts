import { NextResponse } from "next/server";
import { CATEGORY } from "@/config/category";
import { getSources } from "@/lib/sources";

/**
 * GET /api/sources
 *
 * The source registry with each source's whole-source figures and snapshot
 * freshness -- the per-language rows are deliberately left out, since they are
 * the large part and /api/languages already indexes them.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const sources = getSources().map((s) => ({
    id: s.id,
    name: s.name,
    blurb: s.blurb,
    appUrl: s.appUrl,
    tags: s.tags,
    languageCount: s.languageCount,
    snapshot: s.snapshot
      ? {
          generatedAt: s.snapshot.generatedAt,
          label: s.snapshot.label,
          file: s.snapshot.file,
          overviewStats: s.snapshot.overviewStats,
        }
      : null,
  }));

  return NextResponse.json({ category: CATEGORY.title, sources });
}
