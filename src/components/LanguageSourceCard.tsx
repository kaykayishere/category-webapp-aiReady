import Link from "next/link";
import { formatStat, formatTrend } from "@/lib/format";
import type { LanguageSourceCard as CardData } from "@/lib/languages";

/**
 * One source's summary of one language: the source's own top three figures,
 * then the way deeper -- to this app's own detail page for that source and
 * language, which carries every figure the source reported plus its caveats
 * and provenance.
 *
 * Three states, all of them honest: covered, source has data but not for this
 * language, and source has no snapshot at all.
 */
export default function LanguageSourceCard({
  card,
  languageName,
}: {
  card: CardData;
  languageName: string;
}) {
  const { source, record, topStats, externalUrl } = card;
  const sourceHref = `/source/${encodeURIComponent(source.id)}`;
  const detailHref = `${sourceHref}/${encodeURIComponent(card.code)}`;

  if (!record) {
    return (
      <div className="card-empty px-5 py-4">
        <h3 className="font-display text-xl text-ink-soft">{source.name}</h3>
        <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
          {source.snapshot
            ? `No entry for ${languageName} in this source's latest snapshot.`
            : "No snapshot harvested for this source yet."}
        </p>
        <Link
          href={sourceHref}
          className="font-mono text-xs text-ink-soft hover:text-brass transition-colors mt-3 inline-block"
        >
          Source overview →
        </Link>
      </div>
    );
  }

  return (
    <div className="card px-5 py-4 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl">{source.name}</h3>
        {source.snapshot && (
          <span className="pill shrink-0">{source.snapshot.label}</span>
        )}
      </div>

      {topStats.length > 0 ? (
        <dl className="grid grid-cols-3 gap-3 mt-4">
          {topStats.map((stat) => (
            <div key={stat.label}>
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="font-display text-2xl mt-1">{formatStat(stat)}</dd>
              {stat.trend !== undefined && stat.trend !== 0 && (
                <div
                  className={`font-mono text-[11px] mt-0.5 ${
                    stat.trend > 0 ? "text-up" : "text-down"
                  }`}
                >
                  {formatTrend(stat.trend, stat.format)}
                </div>
              )}
              {stat.hint && (
                <div className="text-[11px] text-ink-soft mt-0.5">{stat.hint}</div>
              )}
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-ink-soft mt-3">
          Listed for {languageName}, with no figures reported.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-line">
        <Link href={detailHref} className="btn btn-primary">
          Full summary
        </Link>
        <Link href={sourceHref} className="btn">
          Compare languages
        </Link>
        {externalUrl && (
          // Upstream provenance, when the source publishes its own page for
          // this language. Secondary to the in-app detail page: it leaves the
          // app, so it is a plain <a> and never the primary action.
          <a
            href={externalUrl}
            className="font-mono text-xs text-ink-soft hover:text-brass transition-colors"
          >
            upstream ↗
          </a>
        )}
      </div>
    </div>
  );
}
