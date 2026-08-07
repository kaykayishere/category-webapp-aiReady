import { CATEGORY } from "@/config/category";
import { getSources } from "@/lib/sources";
import { getCategoryTotals, getLanguageIndex } from "@/lib/languages";
import { StatCard } from "@/components/StatCard";
import SourceCard from "@/components/SourceCard";
import SearchPanel from "@/components/SearchPanel";
import LanguageSearch from "@/components/LanguageSearch";
import { Footer } from "@/components/Footer";

// Re-read /data per request rather than freezing it at build time, so a new
// snapshot from a harvesting script is live without a redeploy.
export const dynamic = "force-dynamic";

export default function Home() {
  const sources = getSources();
  const languages = getLanguageIndex();
  const totals = getCategoryTotals();
  const { plural, singular } = CATEGORY.sourceNoun;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <p className="eyebrow">
          {totals.sourceCount} {totals.sourceCount === 1 ? singular : plural}
          {totals.newestSnapshot ? ` · updated ${totals.newestSnapshot}` : ""}
        </p>
        <h1 className="font-display text-5xl sm:text-6xl mt-3 leading-[1.05]">
          {CATEGORY.title}
        </h1>
        <p className="text-ink-soft mt-5 max-w-2xl leading-relaxed">
          {CATEGORY.tagline}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-12">
        <StatCard
          label={plural}
          value={`${totals.sourcesWithData} / ${totals.sourceCount}`}
          hint="with data harvested"
          raised
        />
        <StatCard
          label="Languages covered"
          value={totals.languageCount.toLocaleString()}
          hint={`across all ${plural}`}
          raised
        />
        <StatCard
          label="In two or more"
          value={totals.multiSourceLanguageCount.toLocaleString()}
          hint="comparable across sources"
          raised
        />
        <StatCard
          label="Latest snapshot"
          value={totals.newestSnapshot ?? "—"}
          raised
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <SearchPanel
          languageLabel="By language"
          sourceLabel={`By ${singular}`}
          languageHint={`Start from a language to see how every ${singular} in this category covers it, side by side.`}
          sourceHint={`Start from a ${singular} to search within it on its own terms.`}
          languagePanel={
            <LanguageSearch
              languages={languages}
              sourceCount={totals.sourceCount}
              noun={CATEGORY.sourceNoun}
            />
          }
          sourcePanel={
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          }
        />
      </div>

      <Footer sources={sources} />
    </main>
  );
}
