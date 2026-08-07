import Link from "next/link";
import { CATEGORY } from "@/config/category";
import { formatStat } from "@/lib/format";
import type { SourceView } from "@/lib/types";

/**
 * A data source as it appears in the homepage grid: name, what it is, its two
 * leading whole-source figures, and the way into its page in this app.
 */
export default function SourceCard({ source }: { source: SourceView }) {
  const stats = source.snapshot?.overviewStats.slice(0, 2) ?? [];

  return (
    <Link
      href={`/source/${encodeURIComponent(source.id)}`}
      className="card-raised block px-5 py-4 group"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl group-hover:text-brass transition-colors">
          {source.name}
        </h3>
        {source.snapshot ? (
          <span className="pill shrink-0">
            {source.languageCount.toLocaleString()} lang
          </span>
        ) : (
          <span className="pill pill-accent shrink-0">pending</span>
        )}
      </div>

      <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{source.blurb}</p>

      {stats.length > 0 && (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="font-mono text-sm mt-0.5">{formatStat(stat)}</dd>
            </div>
          ))}
        </dl>
      )}

      {!source.snapshot && (
        <p className="text-xs text-ink-soft font-mono mt-3">
          {`No snapshot in data/${source.id}/ yet`}
        </p>
      )}

      <div className="mt-3 text-xs font-mono text-ink-soft group-hover:text-brass transition-colors">
        Search this {CATEGORY.sourceNoun.singular} →
      </div>
    </Link>
  );
}
