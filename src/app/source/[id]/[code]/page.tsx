import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY } from "@/config/category";
import { getSource, getSources, sourceDetailUrl } from "@/lib/sources";
import { getLanguageDetail } from "@/lib/languages";
import { StatTile } from "@/components/StatCard";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}): Promise<Metadata> {
  const { id, code } = await params;
  const source = getSource(decodeURIComponent(id));
  const language = getLanguageDetail(decodeURIComponent(code));
  if (!source) return { title: CATEGORY.title };
  return {
    title: `${language.name} in ${source.name} — ${CATEGORY.title}`,
    description: `${source.name}'s full detail for ${language.name}.`,
  };
}

/**
 * One source × one language, in depth -- where a card on the language page
 * leads. The card carries three figures; this page carries every figure the
 * source reported, plus the fields, caveats, and provenance links that make a
 * number quotable.
 *
 * Deliberately part of this app rather than a per-source app: a reader going
 * deeper on one source should not have to cross a deployment boundary, and one
 * detail page that adapts to whatever a source reported serves every source.
 */
export default async function SourceLanguagePage({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}) {
  const { id, code } = await params;
  const source = getSource(decodeURIComponent(id));
  if (!source) notFound();

  const allSources = getSources();
  const language = getLanguageDetail(decodeURIComponent(code));
  const record =
    source.snapshot?.languages.find((l) => l.code === language.code) ?? null;
  const upstreamUrl = record ? sourceDetailUrl(source, record) : undefined;

  const stats = record?.stats ?? [];
  const details = record?.details ?? [];
  const notes = record?.notes ?? [];
  const links = record?.links ?? [];

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-6 w-full flex flex-wrap gap-x-6 gap-y-2">
        <Link
          href={`/language/${encodeURIComponent(language.code)}`}
          className="font-mono text-xs text-ink-soft hover:text-brass"
        >
          ← {language.name} across all {CATEGORY.sourceNoun.plural}
        </Link>
        <Link
          href={`/source/${encodeURIComponent(source.id)}`}
          className="font-mono text-xs text-ink-soft hover:text-brass"
        >
          ← All languages in {source.name}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 w-full">
        <div className="border-b border-line pb-6">
          <p className="eyebrow">
            {source.name}
            {source.snapshot ? ` · ${source.snapshot.label}` : ""}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
            <h1 className="font-display text-4xl sm:text-5xl">
              {language.name}{" "}
              <span className="font-mono text-base text-ink-soft align-middle">
                {language.code}
              </span>
            </h1>
            {upstreamUrl && (
              // Upstream provenance, when the source has a public page for this
              // language. Leaves the app, so a plain <a>.
              <a href={upstreamUrl} className="btn">
                View upstream
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>

        {!record ? (
          <div className="card-empty px-6 py-8 mt-8 text-sm text-ink-soft">
            <p className="font-medium text-ink">
              {source.name} has no entry for {language.name}.
            </p>
            <p className="mt-2 leading-relaxed">
              {source.snapshot
                ? `The language is absent from this ${CATEGORY.sourceNoun.singular}'s latest snapshot (${source.snapshot.label}). That is a real gap in coverage, not a missing page.`
                : `This ${CATEGORY.sourceNoun.singular} has no snapshot harvested yet.`}
            </p>
            <Link
              href={`/language/${encodeURIComponent(language.code)}`}
              className="btn mt-5"
            >
              See which {CATEGORY.sourceNoun.plural} cover {language.name}
            </Link>
          </div>
        ) : (
          <>
            {stats.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-2xl mb-3">Figures</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {stats.map((stat) => (
                    <StatTile key={stat.label} stat={stat} />
                  ))}
                </div>
              </section>
            )}

            {details.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl mb-3">Detail</h2>
                <div className="card overflow-hidden">
                  <dl className="divide-y divide-line">
                    {details.map((field) => (
                      <div
                        key={field.label}
                        className="grid sm:grid-cols-[minmax(0,14rem)_1fr] gap-1 sm:gap-4 px-4 py-3"
                      >
                        <dt className="eyebrow sm:pt-0.5">{field.label}</dt>
                        <dd className="text-sm font-mono break-words">
                          {String(field.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )}

            {notes.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl mb-3">
                  Notes from {source.name}
                </h2>
                <ul className="card px-5 py-4 space-y-2 text-sm text-ink-soft leading-relaxed list-disc list-inside">
                  {notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </section>
            )}

            {links.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-2xl mb-3">Provenance</h2>
                <ul className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        className="btn"
                        rel="noreferrer"
                        target="_blank"
                      >
                        {link.label}
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {stats.length === 0 &&
              details.length === 0 &&
              notes.length === 0 &&
              links.length === 0 && (
                <div className="card-empty px-6 py-8 mt-8 text-sm text-ink-soft">
                  {source.name} lists {language.name} but reported no figures for
                  it.
                </div>
              )}
          </>
        )}

        <section className="mt-12 border-t border-line pt-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/source/${encodeURIComponent(source.id)}?lang=${encodeURIComponent(language.code)}`}
              className="btn"
            >
              Compare with other languages in {source.name}
            </Link>
            <Link
              href={`/language/${encodeURIComponent(language.code)}`}
              className="btn"
            >
              Compare with other {CATEGORY.sourceNoun.plural}
            </Link>
          </div>
          {source.snapshot && (
            <p className="text-xs text-ink-soft font-mono mt-4">
              {`Source snapshot: ${source.snapshot.file} · harvested ${source.snapshot.label}`}
            </p>
          )}
        </section>
      </div>

      <Footer sources={allSources} />
    </main>
  );
}
