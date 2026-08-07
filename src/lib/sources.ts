import fs from "fs";
import path from "path";
import { SOURCES, findSource, type SourceConfig } from "@/config/sources";
import type {
  DetailField,
  ExternalLink,
  LanguageRecord,
  SourceSnapshot,
  SourceView,
  Stat,
} from "./types";

// ---------------------------------------------------------------------------
// The single ingestion point for this category app.
//
// HOW A HARVESTING SCRIPT'S OUTPUT GETS PICKED UP AUTOMATICALLY:
// each source writes JSON snapshots to  data/<source-id>/<name>.json  , named
// so they sort chronologically. On every request this module re-reads the
// /data tree and uses the newest file per source, so adding a snapshot -- or a
// whole new source, once it is listed in config/sources.ts -- needs no code
// change. Pages are `export const dynamic = "force-dynamic"` so this is
// re-evaluated per request rather than frozen at build time.
//
// Parse results are cached against the mtimes of the files they came from, so
// repeated requests between harvests do not re-read or re-parse anything.
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");

function formatLabel(d: Date): string {
  return (
    d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: false,
    }) + " UTC"
  );
}

/** Prefers the snapshot's own timestamp; falls back to a date in the filename. */
function resolveTimestamp(filename: string, declared?: unknown): Date {
  if (typeof declared === "string") {
    const d = new Date(declared);
    if (!isNaN(d.getTime())) return d;
  }
  const m = filename.match(/(\d{4}-\d{2}-\d{2})(?:[_-](\d{2})(\d{2}))?/);
  if (m) {
    const [, ymd, hh, mm] = m;
    return new Date(`${ymd}T${hh ?? "00"}:${mm ?? "00"}:00Z`);
  }
  return new Date(0);
}

function coerceStats(raw: unknown): Stat[] {
  if (!Array.isArray(raw)) return [];
  const stats: Stat[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (typeof r.label !== "string" || r.label.trim() === "") continue;
    const value =
      typeof r.value === "number" || typeof r.value === "string" ? r.value : "—";
    stats.push({
      label: r.label,
      value,
      format:
        r.format === "number" ||
        r.format === "percent" ||
        r.format === "text" ||
        r.format === "date"
          ? r.format
          : undefined,
      hint: typeof r.hint === "string" ? r.hint : undefined,
      trend: typeof r.trend === "number" ? r.trend : undefined,
    });
  }
  return stats;
}

function coerceDetails(raw: unknown): DetailField[] {
  if (!Array.isArray(raw)) return [];
  const out: DetailField[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (typeof r.label !== "string" || !r.label.trim()) continue;
    if (typeof r.value !== "string" && typeof r.value !== "number") continue;
    out.push({ label: r.label, value: r.value });
  }
  return out;
}

function coerceNotes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((n): n is string => typeof n === "string" && n.trim() !== "");
}

function coerceLinks(raw: unknown): ExternalLink[] {
  if (!Array.isArray(raw)) return [];
  const out: ExternalLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    if (typeof r.label !== "string" || typeof r.url !== "string") continue;
    // Only http(s): a snapshot is data, and data must not be able to inject a
    // javascript: or data: URL into a rendered link.
    if (!/^https?:\/\//i.test(r.url)) continue;
    out.push({ label: r.label, url: r.url });
  }
  return out;
}

function coerceLanguages(raw: unknown): LanguageRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: LanguageRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const code = typeof r.code === "string" ? r.code.trim().toLowerCase() : "";
    if (!code) continue;
    out.push({
      code,
      name: typeof r.name === "string" && r.name.trim() ? r.name.trim() : undefined,
      stats: coerceStats(r.stats),
      details: coerceDetails(r.details),
      notes: coerceNotes(r.notes),
      links: coerceLinks(r.links),
      detailPath: typeof r.detailPath === "string" ? r.detailPath : undefined,
    });
  }
  return out;
}

/**
 * Newest snapshot filename for a source, or null. Sorted lexicographically,
 * which is why the naming convention puts an ISO date in the filename.
 */
function newestSnapshotFile(sourceId: string): string | null {
  const dir = path.join(DATA_DIR, sourceId);
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort();
  return files.length ? files[files.length - 1] : null;
}

function readSnapshot(source: SourceConfig): SourceSnapshot | null {
  const file = newestSnapshotFile(source.id);
  if (!file) return null;

  let parsed: Record<string, unknown>;
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, source.id, file), "utf-8");
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // A half-written or malformed snapshot must not take the page down: the
    // source falls back to its "no data yet" state, same as a missing file.
    return null;
  }

  const date = resolveTimestamp(file, parsed.generatedAt);
  return {
    sourceId: source.id,
    generatedAt: date.toISOString(),
    label: formatLabel(date),
    file,
    overviewStats: coerceStats(parsed.overviewStats),
    languages: coerceLanguages(parsed.languages),
  };
}

let cache: { key: string; views: SourceView[] } | null = null;

/** mtime+name fingerprint of every snapshot file the app would read. */
function fingerprint(): string {
  return SOURCES.map((s) => {
    const file = newestSnapshotFile(s.id);
    if (!file) return `${s.id}:none`;
    const stat = fs.statSync(path.join(DATA_DIR, s.id, file));
    return `${s.id}:${file}:${stat.mtimeMs}`;
  }).join("|");
}

/**
 * Every registered source in config order, each with its newest snapshot.
 * Sources without data are included with `snapshot: null` -- the UI shows
 * them as pending rather than hiding them, so a reader can see what the
 * category intends to cover, not just what has landed.
 */
export function getSources(): SourceView[] {
  const key = fingerprint();
  if (cache && cache.key === key) return cache.views;

  const views: SourceView[] = SOURCES.map((source) => {
    const snapshot = readSnapshot(source);
    return {
      id: source.id,
      name: source.name,
      blurb: source.blurb,
      appUrl: source.appUrl,
      tags: source.tags,
      snapshot,
      languageCount: snapshot ? new Set(snapshot.languages.map((l) => l.code)).size : 0,
    };
  });

  cache = { key, views };
  return views;
}

export function getSource(id: string): SourceView | undefined {
  if (!findSource(id)) return undefined;
  return getSources().find((s) => s.id === id);
}

/** Absolute link into a source's own webapp, for a language or its root. */
export function sourceDetailUrl(
  source: Pick<SourceView, "appUrl">,
  record?: LanguageRecord
): string | undefined {
  if (!source.appUrl) return undefined;
  const base = source.appUrl.replace(/\/+$/, "");
  if (!record?.detailPath) return base;
  const suffix = record.detailPath.startsWith("/")
    ? record.detailPath
    : `/${record.detailPath}`;
  return `${base}${suffix}`;
}
