import { LANGUAGE_NAME_OVERRIDES } from "@/config/language-names";
import { getSources, sourceDetailUrl } from "./sources";
import type { LanguageRecord, SourceView, Stat } from "./types";

/**
 * The cross-source language index.
 *
 * Languages are matched across sources by code alone. Names are only for
 * display and for search, so a source that omits a name costs nothing as long
 * as some other source supplies one.
 */

export interface LanguageIndexEntry {
  code: string;
  name: string;
  /** Ids of the sources that have any data for this language. */
  sourceIds: string[];
  sourceCount: number;
}

export interface LanguageSourceCard {
  source: SourceView;
  /** The language this card is about -- the card links to /source/<id>/<code>. */
  code: string;
  /** null when this source has no snapshot, or no row for this language. */
  record: LanguageRecord | null;
  /** At most three stats -- what the card shows. */
  topStats: Stat[];
  /** Deep link into the source's own webapp, when it has one. */
  externalUrl?: string;
}

export interface LanguageDetail {
  code: string;
  name: string;
  cards: LanguageSourceCard[];
  coveredCount: number;
}

function displayName(code: string, candidates: (string | undefined)[]): string {
  const override = LANGUAGE_NAME_OVERRIDES[code];
  if (override) return override;
  const first = candidates.find((c) => c && c.trim());
  // No source named it: show the bare code rather than inventing a name.
  return first ? first.trim() : code;
}

let cache: { key: string; index: LanguageIndexEntry[] } | null = null;

/** Every language any source has data for, sorted by display name. */
export function getLanguageIndex(): LanguageIndexEntry[] {
  const sources = getSources();
  // getSources() is already mtime-cached, so identity of its snapshots is a
  // sound cache key for the derived index.
  const key = sources.map((s) => `${s.id}:${s.snapshot?.file ?? "none"}:${s.snapshot?.generatedAt ?? ""}`).join("|");
  if (cache && cache.key === key) return cache.index;

  const map = new Map<string, { names: (string | undefined)[]; sourceIds: Set<string> }>();
  for (const source of sources) {
    if (!source.snapshot) continue;
    for (const record of source.snapshot.languages) {
      let entry = map.get(record.code);
      if (!entry) {
        entry = { names: [], sourceIds: new Set() };
        map.set(record.code, entry);
      }
      entry.names.push(record.name);
      entry.sourceIds.add(source.id);
    }
  }

  const index = Array.from(map, ([code, entry]) => ({
    code,
    name: displayName(code, entry.names),
    sourceIds: Array.from(entry.sourceIds),
    sourceCount: entry.sourceIds.size,
  })).sort((a, b) => a.name.localeCompare(b.name));

  cache = { key, index };
  return index;
}

/**
 * One language across every registered source, including the sources with
 * nothing for it -- an explicit gap is a finding, not something to hide.
 */
export function getLanguageDetail(rawCode: string): LanguageDetail {
  const code = rawCode.trim().toLowerCase();
  const sources = getSources();
  const names: (string | undefined)[] = [];

  const cards: LanguageSourceCard[] = sources.map((source) => {
    const record =
      source.snapshot?.languages.find((l) => l.code === code) ?? null;
    if (record?.name) names.push(record.name);
    return {
      source,
      code,
      record,
      topStats: (record?.stats ?? []).slice(0, 3),
      externalUrl: record ? sourceDetailUrl(source, record) : undefined,
    };
  });

  return {
    code,
    name: displayName(code, names),
    cards,
    coveredCount: cards.filter((c) => c.record).length,
  };
}

/** Whole-category counts for the homepage stat row. */
export function getCategoryTotals() {
  const sources = getSources();
  const index = getLanguageIndex();
  const withData = sources.filter((s) => s.snapshot);
  const newest = withData
    .map((s) => s.snapshot!.generatedAt)
    .sort()
    .at(-1);
  return {
    sourceCount: sources.length,
    sourcesWithData: withData.length,
    languageCount: index.length,
    /** Languages present in more than one source -- the comparable ones. */
    multiSourceLanguageCount: index.filter((l) => l.sourceCount > 1).length,
    newestSnapshot: newest
      ? withData.find((s) => s.snapshot!.generatedAt === newest)!.snapshot!.label
      : null,
  };
}
