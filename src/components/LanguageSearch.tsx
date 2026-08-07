"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LanguageIndexEntry } from "@/lib/languages";

/**
 * Search across every source at once. Matches on display name and on code, so
 * a reader who knows the code ("amh") gets there as fast as one who knows the
 * name. Results link to the language's cross-source summary page.
 */
export default function LanguageSearch({
  languages,
  sourceCount,
  noun,
}: {
  languages: LanguageIndexEntry[];
  /** Total registered sources, for the "2 of 3 sources" count on each row. */
  sourceCount: number;
  noun: { singular: string; plural: string };
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return languages
      .filter((l) => l.name.toLowerCase().includes(q) || l.code.includes(q))
      // Exact code and prefix matches first -- typing "fr" should not bury
      // French under every language with "fr" somewhere in its name.
      .sort((a, b) => rank(a, q) - rank(b, q) || a.name.localeCompare(b.name))
      .slice(0, 25);
  }, [languages, query]);

  return (
    <div>
      <label htmlFor="language-search" className="sr-only">
        Search by language
      </label>
      <input
        id="language-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by language name or code…"
        autoComplete="off"
        className="field sm:max-w-md"
      />

      {matches.length > 0 && (
        <ul className="mt-3 sm:max-w-md card divide-y divide-line overflow-hidden">
          {matches.map((l) => (
            <li key={l.code}>
              <Link
                href={`/language/${encodeURIComponent(l.code)}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-paper/50 transition-colors"
              >
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className="font-medium text-ink truncate">{l.name}</span>
                  <span className="font-mono text-xs text-ink-soft">{l.code}</span>
                </span>
                <span className="font-mono text-xs text-ink-soft shrink-0">
                  {l.sourceCount} of {sourceCount}{" "}
                  {sourceCount === 1 ? noun.singular : noun.plural}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {query.trim() && matches.length === 0 && (
        <p className="mt-3 text-sm text-ink-soft">
          No languages match &ldquo;{query.trim()}&rdquo;.
        </p>
      )}

      {!query.trim() && (
        <p className="mt-3 text-sm text-ink-soft">
          {`${languages.length.toLocaleString()} languages have data in at least one ${noun.singular}.`}
        </p>
      )}
    </div>
  );
}

function rank(entry: LanguageIndexEntry, q: string): number {
  if (entry.code === q) return 0;
  if (entry.name.toLowerCase().startsWith(q)) return 1;
  if (entry.code.startsWith(q)) return 2;
  return 3;
}
