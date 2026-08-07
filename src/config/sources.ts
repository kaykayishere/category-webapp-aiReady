/**
 * The registry of data sources this category tracks.
 *
 * One entry per source, in the order they should appear on the homepage grid
 * and on a language's card stack. A source appears in the UI as soon as it is
 * listed here -- with an honest "no data yet" state until a snapshot shows up
 * under `data/<id>/`, so you can register a source before its harvesting
 * script exists.
 *
 * The three entries below are placeholders. Replace them; nothing else in the
 * codebase refers to these ids.
 */
export interface SourceConfig {
  /** Must match the folder name under /data. Lowercase, kebab-case. */
  id: string;
  /** Display name, e.g. the project's own name for itself. */
  name: string;
  /** One line: what this source is and what it measures. */
  blurb: string;
  /**
   * The source's public upstream site, if it has one -- a project homepage, a
   * repository, a translation portal. Optional and secondary: in-depth pages
   * live inside this app at /source/<id> and /source/<id>/<code>, so a source
   * with no upstream site of its own loses nothing by omitting this.
   */
  appUrl?: string;
  /** Optional short descriptors rendered as pills on the source card. */
  tags?: string[];
}

export const SOURCES: SourceConfig[] = [
  {
    id: "source-one",
    name: "Placeholder source one",
    blurb:
      "Placeholder: describe what this source catalogues and what its numbers count.",
    appUrl: "https://example.com/source-one",
    tags: ["placeholder"],
  },
  {
    id: "source-two",
    name: "Placeholder source two",
    blurb:
      "Placeholder: a second source, to show how two sources sit side by side on a language page.",
    appUrl: "https://example.com/source-two",
    tags: ["placeholder"],
  },
  {
    id: "source-three",
    name: "Placeholder source three",
    blurb:
      "Placeholder: registered but with no snapshot in /data yet — this is what the empty state looks like.",
    tags: ["placeholder", "no data yet"],
  },
];

export function findSource(id: string): SourceConfig | undefined {
  return SOURCES.find((s) => s.id === id);
}
