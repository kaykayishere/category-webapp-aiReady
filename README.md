# Category app template

A blank-slate Next.js app for one **meta-category** in the system — the layer
above an individual data source. It answers two questions:

- **By language** — for a given language, how does every data source in this
  category cover it? One card per source with that source's top 1–3 figures,
  each leading to a full in-app detail page for that source and language.
- **By data source** — pick a source, then search within it by language (and
  filter by which languages it shares with the category's other sources).

Nothing here names a category or a source. Copy this folder, edit two config
files, drop in harvested JSON, and you have the category app.

Handing this to a team? [`TEAM.md`](TEAM.md) has the step-by-step, including
ready-to-use prompts for adding a source.

## Quick start

```bash
npm install && npm run dev
```

The app boots with placeholder data so every page renders immediately. Then:

1. **`src/config/category.ts`** — the title, tagline, footer note, and the
   back-link to the parent portal.
2. **`src/config/sources.ts`** — one entry per data source: id, name, blurb,
   and the URL of its own in-depth webapp. A source shows up in the UI as soon
   as it is listed, with an explicit "no data yet" state until a snapshot
   arrives — so register sources before their harvesting scripts exist.
3. **`data/<source-id>/*.json`** — the harvested snapshots. See
   [`data/README.md`](data/README.md) for the contract. Delete the two
   placeholder folders once real data lands.

No other file needs editing to stand up a new category.

## How data flows in

Each source's Python harvesting script writes one JSON snapshot per run to
`data/<source-id>/<source-id>_YYYY-MM-DD_HHmm.json`. Pages are
`dynamic = "force-dynamic"` and `src/lib/sources.ts` re-reads `data/` per
request, caching parses against file mtimes — so a new snapshot is live without
a code change or a redeploy, and repeated requests between harvests cost
nothing.

The contract is deliberately shapeless about *what* a source measures: a
snapshot supplies `{label, value}` stats and the UI adapts (cards show the
first three, the source page's table turns each label into a sortable column).
Two sources in the same category can report entirely different figures. The one
thing they must share is a **language code system**, since codes are what match
a language's cards together.

## Routes

| route                    | what it is                                                                |
| ------------------------ | ------------------------------------------------------------------------- |
| `/`                      | Title, category totals, and the two searches (language / source).         |
| `/language/[code]`       | One language across every source: a card each, each linking to detail.    |
| `/source/[id]`           | One source: its overview figures, plus its searchable language table.     |
| `/source/[id]/[code]`    | One source × one language, in depth — every figure, plus fields, caveats, provenance. |
| `/api/languages`         | JSON: the cross-source language index, for the parent portal.             |
| `/api/sources`           | JSON: the source registry with overview figures and snapshot dates.       |

There is deliberately **no separate app per source**. A card's "Full summary"
goes to `/source/[id]/[code]` inside this app, which renders whatever
`details` / `notes` / `links` that source's snapshot supplied — so a new source
gets a full detail page with no new pages written. `appUrl` is only for linking
out to a source's public upstream site, and is optional.

`/source/[id]?lang=<code>` prefills that source's search — how a detail page
hands back to a whole-source comparison.

Any language code renders at `/language/[code]`, including one no source covers
(an explicit "nothing yet" beats a 404 that reads like a broken link). An
unregistered source id *is* a 404.

## Layout

```
src/
  config/
    category.ts         ← edit: what this category is
    sources.ts          ← edit: which sources it tracks
    language-names.ts   ← optional: display-name overrides when sources disagree
  lib/
    types.ts            the snapshot contract, annotated
    sources.ts          reads data/, caches on mtime, tolerates bad files
    languages.ts        cross-source language index and per-language detail
    format.ts           number / percent / date / trend rendering
  components/           TopBar, StatCard, SourceCard, LanguageSourceCard,
                        SearchPanel, LanguageSearch, SourceLanguageTable, Footer
  app/                  the routes above, plus not-found
data/                   harvested snapshots, one folder per source
```

## Styling

`src/app/globals.css` holds the shared house style — warm paper palette, one
orange accent, Fraunces for display and IBM Plex for text and figures. The
tokens and component classes (`.card`, `.card-raised`, `.btn`, `.field`,
`.seg`, `.pill`, `.eyebrow`) are meant to be identical across every category
app so the portal reads as one system; change them only when restyling
everything. `.card-raised` is the physical, pressable treatment — keep it for
the small number of tappable summary tiles on a page, or it stops signalling
anything.

## Deploying as a portal zone

Standalone, the app serves from `/`. To mount it as a zone of a larger portal,
set `NEXT_PUBLIC_BASE_PATH` (e.g. `/input-and-localization`) and add the
matching rewrite in the root app. `next.config.ts` picks it up; Next.js
prefixes links and assets automatically, so no page code changes.
