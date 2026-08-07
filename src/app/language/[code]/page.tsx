import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORY } from "@/config/category";
import { getLanguageDetail } from "@/lib/languages";
import { getSources } from "@/lib/sources";
import LanguageSourceCard from "@/components/LanguageSourceCard";
import { StatCard } from "@/components/StatCard";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const detail = getLanguageDetail(decodeURIComponent(code));
  return {
    title: `${detail.name} — ${CATEGORY.title}`,
    description: `How each ${CATEGORY.sourceNoun.singular} in ${CATEGORY.title} covers ${detail.name}.`,
  };
}

/**
 * One language across the whole category: a card per data source with that
 * source's top figures, and a way through to the source's own webapp for the
 * full picture.
 *
 * Any code renders, including one no source has data for -- a reader arriving
 * from the portal with a language code should get an explicit "nothing here
 * yet" rather than a 404 that reads like a broken link.
 */
export default async function LanguagePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const detail = getLanguageDetail(decodeURIComponent(code));
  const sources = getSources();
  const { plural, singular } = CATEGORY.sourceNoun;
  const gaps = sources.length - detail.coveredCount;

  return (
    <main className="flex-1 flex flex-col">
      <div className="max-w-6xl mx-auto px-6 py-6 w-full">
        <Link href="/" className="font-mono text-xs text-ink-soft hover:text-brass">
          ← All languages and {plural}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 w-full">
        <div className="border-b border-line pb-6">
          <p className="eyebrow text-brass">{detail.code}</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">{detail.name}</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          <StatCard
            label={`${plural} covering it`}
            value={`${detail.coveredCount} / ${sources.length}`}
          />
          <StatCard
            label="Language code"
            value={detail.code}
            hint="as reported by the sources"
          />
          <StatCard
            label="Gaps"
            value={gaps.toLocaleString()}
            hint={`${gaps === 1 ? singular : plural} with no entry`}
          />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl">By {singular}</h2>
          <p className="text-sm text-ink-soft mt-0.5 mb-4">
            Each {singular} reports its own leading figures for {detail.name}. Open
            one for its full summary.
          </p>
          <div className="grid lg:grid-cols-2 gap-4">
            {detail.cards.map((card) => (
              <LanguageSourceCard
                key={card.source.id}
                card={card}
                languageName={detail.name}
              />
            ))}
          </div>
        </section>
      </div>

      <Footer sources={sources} />
    </main>
  );
}
