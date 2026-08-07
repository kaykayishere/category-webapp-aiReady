import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY } from "@/config/category";
import { getSource, getSources } from "@/lib/sources";
import SourceLanguageTable, {
  type CrossSourceFilter,
  type TableRow,
} from "@/components/SourceLanguageTable";
import { StatTile } from "@/components/StatCard";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const source = getSource(decodeURIComponent(id));
  if (!source) return { title: CATEGORY.title };
  return {
    title: `${source.name} — ${CATEGORY.title}`,
    description: source.blurb,
  };
}

/**
 * One data source on its own terms: its whole-source figures, then every
 * language it covers, searchable and sortable by whichever figures it happens
 * to report.
 *
 * `?lang=` prefills the search, so a card on a language page can hand off to
 * this page already narrowed to that language.
 */
export default async function SourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const source = getSource(decodeURIComponent(id));
  // Unknown id means a bad link, not an empty source -- those are different
  // failures and only one of them is a 404.
  if (!source) notFound();

  const allSources = getSources();
  const snapshot = source.snapshot;

  // Columns are the union of the stat labels this source reports, ordered by
  // where they first appear -- so the source's own sense of "most important
  // first" survives into the table without this app knowing what they mean.
  const columns: string[] = [];
  for (const record of snapshot?.languages ?? []) {
    for (const stat of record.stats ?? []) {
      if (!columns.includes(stat.label)) columns.push(stat.label);
    }
  }

  const rows: TableRow[] = (snapshot?.languages ?? []).map((record) => ({
    code: record.code,
    name: record.name?.trim() || record.code,
    stats: record.stats ?? [],
  }));

  const crossSourceFilters: CrossSourceFilter[] = allSources
    .filter((s) => s.id !== source.id && s.snapshot)
    .map((s) => ({
      id: s.id,
      name: s.name,
      codes: Array.from(new Set(s.snapshot!.languages.map((l) => l.code))),
    }));

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-6 w-full">
        <Link href="/" className="font-mono text-xs text-ink-soft hover:text-brass">
          ← All {CATEGORY.sourceNoun.plural}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 w-full">
        <div className="border-b border-line pb-6">
          <p className="eyebrow">{CATEGORY.sourceNoun.singular}</p>
          <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
            <h1 className="font-display text-4xl sm:text-5xl">{source.name}</h1>
            {source.appUrl && (
              // Out to the source's own app: a full page load across apps.
              <a href={source.appUrl} className="btn btn-primary">
                Open {source.name}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
          <p className="text-ink-soft mt-4 max-w-2xl leading-relaxed">
            {source.blurb}
          </p>
          {source.tags && source.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {source.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {snapshot ? (
          <>
            {snapshot.overviewStats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
                {snapshot.overviewStats.slice(0, 8).map((stat) => (
                  <StatTile key={stat.label} stat={stat} />
                ))}
              </div>
            )}

            <section className="mt-10">
              <SourceLanguageTable
                rows={rows}
                columns={columns}
                sourceId={source.id}
                sourceName={source.name}
                initialQuery={lang ?? ""}
                crossSourceFilters={crossSourceFilters}
              />
            </section>
          </>
        ) : (
          <div className="card-empty px-6 py-8 mt-8 text-sm text-ink-soft">
            <p className="font-medium text-ink">No data harvested yet.</p>
            <p className="mt-2 leading-relaxed">
              This {CATEGORY.sourceNoun.singular} is registered in{" "}
              <code className="font-mono">src/config/sources.ts</code> but has no
              snapshot. Add one at{" "}
              <code className="font-mono">data/{source.id}/{source.id}_YYYY-MM-DD_HHmm.json</code>{" "}
              — see <code className="font-mono">data/README.md</code> for the
              expected shape.
            </p>
          </div>
        )}
      </div>

      <Footer sources={allSources} />
    </main>
  );
}
