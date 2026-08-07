/**
 * The snapshot contract every data source's harvesting script writes to.
 *
 * A script drops one JSON file per run into `data/<source-id>/`, named so that
 * the filenames sort chronologically (`<source-id>_YYYY-MM-DD_HHmm.json`).
 * The app reads the newest file per source on each request, so adding a
 * snapshot needs no code change and no redeploy. See `data/README.md` for the
 * annotated example and the field-by-field spec.
 */

export type StatFormat = "number" | "percent" | "text" | "date";

/**
 * One headline number. Deliberately shapeless about *what* it measures: every
 * source counts different things, and this app's job is to show each source's
 * own top figures side by side, not to force them into a shared schema.
 */
export interface Stat {
  /** Short label, e.g. "Records". Doubles as the column header on the source page. */
  label: string;
  value: number | string;
  /**
   * How to render `value`. Defaults to "number" for numbers, "text"
   * otherwise. With "percent", both conventions work: 0.42 and 42 each
   * render as "42%" (values in [0, 1] are read as fractions).
   */
  format?: StatFormat;
  /** Optional clarifier shown under the value, e.g. "since 2019". */
  hint?: string;
  /**
   * Optional change-since-last-snapshot. Positive renders green, negative
   * rust. Compute it in the harvesting script, which is the only place that
   * can compare snapshots meaningfully for that source.
   */
  trend?: number;
}

/** One language's entry within one source's snapshot. */
export interface LanguageRecord {
  /**
   * Language code. Whatever code system the source uses is fine, but be
   * consistent across sources in the same category app -- codes are how a
   * language's cards get matched up. ISO 639-3 is the safe default.
   */
  code: string;
  /** Display name. Optional if another source already supplies one. */
  name?: string;
  /**
   * This source's figures for this language, most important first. The first
   * three appear on the language page card; all of them appear as columns on
   * the source page and as tiles on the detail page.
   */
  stats?: Stat[];
  /**
   * Everything that is worth a page but not a headline: version strings,
   * licences, coverage bands, counts too granular for a tile, qualifiers on
   * how the figures were derived. Rendered as a definition table on
   * /source/<id>/<code>, which is what makes that page deeper than the card.
   */
  details?: DetailField[];
  /**
   * Caveats in the source's own voice -- scope limits, inference methods,
   * anything a reader must know before quoting a figure. Rendered verbatim on
   * the detail page. Prefer over-explaining here: this is the only place a
   * caveat can travel with the number it qualifies.
   */
  notes?: string[];
  /**
   * Provenance links for this language: the upstream file, repository path,
   * API response, or project page the figures came from.
   */
  links?: ExternalLink[];
  /**
   * Path on the source's *upstream* site for this language, appended to the
   * source's `appUrl` (e.g. "/language?code=fra"). Optional, and only for
   * genuinely external destinations -- in-app detail lives at
   * /source/<id>/<code> and needs no configuration.
   */
  detailPath?: string;
}

/** One label/value row in the detail page's definition table. */
export interface DetailField {
  label: string;
  value: string | number;
}

export interface ExternalLink {
  label: string;
  url: string;
}

/** The parsed contents of one snapshot file. */
export interface SourceSnapshot {
  sourceId: string;
  /** ISO timestamp of the harvest, from the file or its filename. */
  generatedAt: string;
  /** Human label for the timestamp, e.g. "Jul 26, 08:30 UTC". */
  label: string;
  /** Filename the snapshot was read from -- shown in the footer. */
  file: string;
  /** Whole-source figures for the source card and source page header. */
  overviewStats: Stat[];
  languages: LanguageRecord[];
}

/** A registered source paired with its newest snapshot, if it has one. */
export interface SourceView {
  id: string;
  name: string;
  blurb: string;
  appUrl?: string;
  tags?: string[];
  snapshot: SourceSnapshot | null;
  languageCount: number;
}
