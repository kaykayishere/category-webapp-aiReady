import { formatStat, formatTrend } from "@/lib/format";
import type { Stat } from "@/lib/types";

/**
 * The headline number tile. `raised` gives it the pressable physical look --
 * used for the homepage row; plain flat cards elsewhere so one page does not
 * have two competing kinds of emphasis.
 */
export function StatCard({
  label,
  value,
  hint,
  trend,
  trendFormat,
  raised = false,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
  trendFormat?: Stat["format"];
  raised?: boolean;
}) {
  return (
    <div className={`${raised ? "card-raised" : "card"} px-4 py-3`}>
      <div className="eyebrow tracking-wider">{label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
      {trend !== undefined && trend !== 0 && (
        <div
          className={`font-mono text-xs mt-0.5 ${trend > 0 ? "text-up" : "text-down"}`}
        >
          {formatTrend(trend, trendFormat)} since last snapshot
        </div>
      )}
      {hint && <div className="text-xs text-ink-soft mt-0.5">{hint}</div>}
    </div>
  );
}

/** Same tile, driven straight off a source-supplied stat. */
export function StatTile({ stat, raised }: { stat: Stat; raised?: boolean }) {
  return (
    <StatCard
      label={stat.label}
      value={formatStat(stat)}
      hint={stat.hint}
      trend={stat.trend}
      trendFormat={stat.format}
      raised={raised}
    />
  );
}
