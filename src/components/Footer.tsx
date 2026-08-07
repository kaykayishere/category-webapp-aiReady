import { CATEGORY } from "@/config/category";
import type { SourceView } from "@/lib/types";

/**
 * Provenance strip: which snapshot each figure on the page came from. Keeping
 * it visible means a stale source is visible as stale rather than silently
 * passing as current.
 */
export function Footer({ sources }: { sources: SourceView[] }) {
  const withData = sources.filter((s) => s.snapshot);

  return (
    <footer className="border-t border-line mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-ink-soft font-mono flex flex-col gap-1">
        <span>{CATEGORY.footerNote}</span>
        {withData.length > 0 ? (
          <span>
            Snapshots:{" "}
            {withData
              .map((s) => `${s.name} — ${s.snapshot!.label}`)
              .join("  ·  ")}
          </span>
        ) : (
          <span>
            No snapshots yet — drop harvested JSON into data/&lt;source-id&gt;/.
          </span>
        )}
      </div>
    </footer>
  );
}
