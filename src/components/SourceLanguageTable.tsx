"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatStat, statSortValue } from "@/lib/format";
import type { Stat } from "@/lib/types";

export interface TableRow {
  code: string;
  name: string;
  stats: Stat[];
}

export interface CrossSourceFilter {
  id: string;
  name: string;
  /** Language codes this other source also covers. */
  codes: string[];
}

/**
 * Every language in one source, searchable and sortable by any figure that
 * source reports. Columns are whatever the source's stats are called -- no
 * fixed schema, so this table works unchanged for any source in any category.
 */
export default function SourceLanguageTable({
  rows,
  columns,
  sourceId,
  sourceName,
  initialQuery = "",
  crossSourceFilters = [],
  pageSize = 200,
}: {
  rows: TableRow[];
  /** Stat labels, in the order the source lists them. */
  columns: string[];
  sourceId: string;
  sourceName: string;
  initialQuery?: string;
  crossSourceFilters?: CrossSourceFilter[];
  pageSize?: number;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sortKey, setSortKey] = useState<string>(columns[0] ?? "name");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [alsoIn, setAlsoIn] = useState<string>("");

  const alsoInCodes = useMemo(() => {
    const filter = crossSourceFilters.find((f) => f.id === alsoIn);
    return filter ? new Set(filter.codes) : null;
  }, [alsoIn, crossSourceFilters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.code.includes(q)
      );
    }
    if (alsoInCodes) list = list.filter((r) => alsoInCodes.has(r.code));

    const byLabel = (row: TableRow, label: string) =>
      row.stats.find((s) => s.label === label);

    return [...list].sort((a, b) => {
      if (sortKey === "name") return sortDir * a.name.localeCompare(b.name);
      const av = statSortValue(byLabel(a, sortKey));
      const bv = statSortValue(byLabel(b, sortKey));
      if (av === bv) return a.name.localeCompare(b.name);
      return sortDir * (av - bv);
    });
  }, [rows, query, sortKey, sortDir, alsoInCodes]);

  function toggleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      // Numbers are most interesting largest-first; names alphabetically.
      setSortDir(key === "name" ? 1 : -1);
    }
  }

  const visible = filtered.slice(0, pageSize);

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl">Languages in {sourceName}</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} shown
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by language name or code…"
            autoComplete="off"
            className="field sm:w-72"
            aria-label={`Search languages in ${sourceName}`}
          />
          {crossSourceFilters.length > 0 && (
            <select
              value={alsoIn}
              onChange={(e) => setAlsoIn(e.target.value)}
              className="field sm:w-60"
              aria-label="Restrict to languages also covered elsewhere"
            >
              <option value="">Any coverage elsewhere</option>
              {crossSourceFilters.map((f) => (
                <option key={f.id} value={f.id}>
                  Also in {f.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-line bg-paper/60">
              <th className="text-left px-4 py-3">
                <SortHeader
                  label="Language"
                  active={sortKey === "name"}
                  dir={sortDir}
                  align="left"
                  onClick={() => toggleSort("name")}
                />
              </th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-3">
                  <SortHeader
                    label={col}
                    active={sortKey === col}
                    dir={sortDir}
                    onClick={() => toggleSort(col)}
                  />
                </th>
              ))}
              <th className="px-3 py-3 text-right">
                <span className="eyebrow">Detail</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={row.code}
                className="border-b border-line/70 last:border-0 hover:bg-paper/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/language/${encodeURIComponent(row.code)}`}
                    className="group"
                  >
                    <div className="font-medium text-ink group-hover:text-brass transition-colors">
                      {row.name}
                    </div>
                    <div className="text-xs text-ink-soft font-mono">{row.code}</div>
                  </Link>
                </td>
                {columns.map((col) => {
                  const stat = row.stats.find((s) => s.label === col);
                  return (
                    <td key={col} className="px-3 py-3 text-right font-mono">
                      {stat ? formatStat(stat) : "—"}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/source/${encodeURIComponent(sourceId)}/${encodeURIComponent(row.code)}`}
                    className="font-mono text-xs text-ink-soft hover:text-brass transition-colors"
                  >
                    detail →
                  </Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-8 text-center text-sm text-ink-soft"
                >
                  No languages match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > visible.length && (
        <p className="text-xs text-ink-soft mt-3 font-mono">
          Showing the first {visible.length.toLocaleString()} of{" "}
          {filtered.length.toLocaleString()} matches — refine the search to narrow
          further.
        </p>
      )}
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  align = "right",
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`eyebrow hover:text-ink transition-colors w-full ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {label}
      {active && <span className="ml-1">{dir === 1 ? "↑" : "↓"}</span>}
    </button>
  );
}
