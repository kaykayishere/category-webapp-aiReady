# Team instructions

How to take this template from blank slate to a working category app. Read
[`data/README.md`](data/README.md) first — it is the contract between the Python
harvesting scripts and the app, and it is the only thing that has to be exactly
right.

## Setup (once per category)

```bash
npm install && npm run dev
```

The app boots on placeholder data so every page renders immediately. Then:

1. `src/config/category.ts` — title, tagline, footer note, parent-portal link.
2. `src/config/sources.ts` — one entry per data source (id, name, blurb;
   `appUrl` only if the source has a public upstream site).
3. `rm -rf data/source-one data/source-two` once real snapshots exist.

Nothing else needs editing to stand up a new category.

## Task 1 — add a data source

Prompt Claude with the harvesting script attached:

> Attached is the harvesting script for `<source name>`. In this category app,
> register it in `src/config/sources.ts` as `<id>`, then write
> `scripts/<id>_to_snapshot.py` that reads the harvester's locale-level output
> and writes a snapshot to `data/<id>/<id>_YYYY-MM-DD_HHmm.json` per the
> contract in `data/README.md`. Normalize language codes to ISO 639-3, attach
> display names, and pick the 3 most meaningful stats for the language cards.
> Run it and confirm the source page renders.

Harvesting scripts do **not** write the app's format — they emit their own
CSV/JSON. Every source needs this converter step. Dropping raw harvester output
into `data/` does nothing at best; at worst a bare JSON array parses as a valid
but empty snapshot, and the card reads "0 languages" instead of "pending".

State these in the prompt. Each one has already bitten:

- **One code system across every source** — ISO 639-3. Codes are the only thing
  matching a language's cards together, so `fr` vs `fra` vs `fr-CA` silently
  fragments one language into three phantoms.
- **Attach display names.** No name → the card shows the bare code.
- **Date in the filename, never overwrite.** Snapshots sort by filename; a fixed
  name kills history (so `trend` can never be computed) and an undated one shows
  up in the footer as harvested in 1970.
- **Percent scale.** Values in `[0, 1]` are read as fractions, so a genuine 0.4%
  renders as "40%". Send sub-1% figures as `format: "number"` with `%` in the
  label.
- **Don't overstate coverage.** If the harvester distinguishes real support from
  weaker evidence (translated UI strings, filename-inferred locales), filter it
  or surface the distinction — and put the caveat in `notes`, where it travels
  with the figure it qualifies. A card claiming support the data doesn't show is
  the worst failure mode here.

## Task 2 — give a source's card a richer destination

**There is no separate app per source.** A card's "Full summary" already goes to
`/source/<id>/<code>` inside this app, which renders whatever that source's
snapshot supplied. To make that page deeper, emit more per language — a
converter change, not an app change:

> Extend `scripts/<id>_to_snapshot.py` to emit `details`, `notes`, and `links`
> per language, per the contract in `data/README.md`. Put the source's scope
> limits and inference caveats in `notes` — anything you would say out loud
> before letting someone quote one of these numbers.

`appUrl` in `src/config/sources.ts` is only for linking out to a source's public
upstream site, and renders as a small secondary link. Leave it unset if there
isn't one; nothing breaks.

## Task 3 — restyle or extend

Palette, cards, buttons, and pills live in `src/app/globals.css` and are meant to
be identical across every category app so the portal reads as one system —
change them only when restyling everything. `.card-raised` is the pressable
treatment; keep it for the few tappable summary tiles per page or it stops
signalling anything.

## Before every PR

```bash
npm run build && npx eslint
```

Then click through: home (both search modes), a language covered by 2+ sources, a
language covered by none, a source with data, a source with no snapshot, and a
source detail page for both a covered and an uncovered language. All of those
render — only an unregistered source id is a 404.

## What not to touch

`src/lib/` (loader, language index, formatting) and `src/components/` are
source-agnostic by design, and `/source/[id]/[code]` adapts to whatever a source
reports. If a new source seems to need a change in there, the converter is
probably the wrong shape — say that in the prompt rather than special-casing the
app.
