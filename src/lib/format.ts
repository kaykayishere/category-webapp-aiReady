import type { Stat } from "./types";

export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

export function formatPercent(value: number): string {
  // Accepts both conventions: 0.42 and 42 both mean 42%. Only values in
  // [0, 1] are read as fractions, so a genuine "1%" must be sent as 1.
  const pct = value > 0 && value <= 1 ? value * 100 : value;
  return `${pct.toFixed(pct < 10 && pct !== 0 ? 1 : 0)}%`;
}

export function formatDate(value: string | number): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Renders a stat's value according to its declared format. */
export function formatStat(stat: Stat): string {
  const { value, format } = stat;
  if (format === "text") return String(value);
  if (format === "date") return formatDate(value);
  if (typeof value !== "number") {
    // A source sent a string where a number was expected -- show it as-is
    // rather than printing NaN.
    return String(value);
  }
  if (format === "percent") return formatPercent(value);
  return formatNumber(value);
}

/** Signed change, for the small trend line under a stat. */
export function formatTrend(trend: number, format?: Stat["format"]): string {
  const sign = trend > 0 ? "+" : trend < 0 ? "−" : "";
  const magnitude = Math.abs(trend);
  const body =
    format === "percent" ? formatPercent(magnitude) : formatNumber(magnitude);
  return `${sign}${body}`;
}

/** Sortable numeric key for a stat; strings sort after every number. */
export function statSortValue(stat: Stat | undefined): number {
  if (!stat) return Number.NEGATIVE_INFINITY;
  return typeof stat.value === "number" ? stat.value : Number.NEGATIVE_INFINITY;
}
