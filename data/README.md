# The data contract

This is the only interface between the Python harvesting scripts and the
webapp. A script that writes files in this shape needs no webapp changes: the
app re-reads this directory on every request and uses the newest snapshot per
source.

## Where files go

```
data/<source-id>/<source-id>_YYYY-MM-DD_HHmm.json
```

- `<source-id>` must match the `id` in `src/config/sources.ts`.
- One file per harvest. Never overwrite — keeping the history lets a source
  report `trend` values and lets you diff a bad harvest against a good one.
- Filenames are compared as strings, and the newest one wins. The
  `YYYY-MM-DD_HHmm` convention is what makes that sort chronological, so keep
  the date at a fixed position in the name.
- A malformed or half-written file is treated as no data at all, not as an
  error — a crashed harvest leaves the app up, showing that source as pending.

`data-raw/` (gitignored) is the conventional place for the unflattened API
dumps a script downloads before reducing them to a snapshot.

## File shape

```jsonc
{
  "sourceId": "source-one",              // informational; the folder name is authoritative
  "generatedAt": "2026-01-15T09:00:00Z", // ISO 8601. Falls back to the date in the filename.

  // Whole-source figures. Shown on the source's homepage card (first two) and
  // across the top of its page (first eight). Most important first.
  "overviewStats": [
    { "label": "Records", "value": 4821, "format": "number", "hint": "in latest harvest", "trend": 63 }
  ],

  // One entry per language this source covers.
  "languages": [
    {
      "code": "fra",                     // required; lowercased on read
      "name": "French",                  // optional if another source names it

      // Headline figures, most important first. The first three appear on the
      // language page card; all of them appear as sortable columns on the
      // source page and as tiles on the detail page.
      "stats": [
        { "label": "Records", "value": 412, "trend": 6 }
      ],

      // Everything below appears only on /source/<id>/<code> -- the in-app
      // detail page the card's "Full summary" button leads to. This is what
      // makes that page worth visiting instead of just a bigger card.
      "details": [                       // label/value rows: versions, licences, methods
        { "label": "Licence", "value": "CC-BY-4.0" }
      ],
      "notes": [                         // caveats in the source's own voice
        "Counts are inferred from resource paths, not a declared support list."
      ],
      "links": [                         // provenance; http(s) only, others dropped
        { "label": "Upstream record", "url": "https://example.org/records/fra" }
      ],

      "detailPath": "/language?code=fra" // optional; appended to the source's appUrl
    }
  ]
}
```

Unknown top-level keys are ignored, so a script can include its own metadata
(`_comment`, run duration, upstream commit) without breaking anything.

### `stat` fields

| field    | required | notes                                                                        |
| -------- | -------- | ---------------------------------------------------------------------------- |
| `label`  | yes      | Short. Doubles as the sortable column header on the source page.             |
| `value`  | yes      | Number or string. A stat with a non-numeric value sorts last.                |
| `format` | no       | `number` (default for numbers), `percent`, `date`, `text`.                    |
| `hint`   | no       | Small clarifier under the value, e.g. `"since 2019"`.                        |
| `trend`  | no       | Change since the previous snapshot. Positive renders green, negative rust.   |

`percent` accepts both conventions: `0.42` and `42` both render as `42%`.
Values in `[0, 1]` are read as fractions, so a genuine 1% must be sent as `1`.

`trend` is the harvesting script's job, not the app's: only the script knows
which of that source's numbers are comparable across snapshots and which are
recomputed from scratch each run.

### Two rules worth following

1. **Use the same language code system across every source in a category.**
   Codes are the only thing matching a language's cards together — a source
   reporting `fr` while another reports `fra` produces two unrelated languages.
   Normalize in the harvesting script; ISO 639-3 is the safe default. Add
   display-name overrides in `src/config/language-names.ts` when sources
   disagree about a name.
2. **Put the figures a reader most wants first.** The language page shows only
   the first three stats per source, and the source page's table sorts by the
   first column by default. Ordering is the only editorial signal the contract
   carries.
3. **Spend the `notes` field.** A caveat only protects a reader if it travels
   with the number it qualifies — scope limits ("this repository is not the
   whole product"), inference methods, and anything you would say out loud
   before letting someone quote a figure belong here, not in a wiki.

## Placeholder data

`source-one/` and `source-two/` hold invented data so the app renders
something on first run. Delete both folders when the real harvests land.
