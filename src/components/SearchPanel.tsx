"use client";

import { useState, type ReactNode } from "react";

type Mode = "language" | "source";

/**
 * The homepage's two ways in. Both panels are always rendered on the server
 * and handed in as slots -- switching modes is pure show/hide, so neither
 * search refetches or loses what the reader typed when they look at the other.
 */
export default function SearchPanel({
  languagePanel,
  sourcePanel,
  languageLabel,
  sourceLabel,
  languageHint,
  sourceHint,
}: {
  languagePanel: ReactNode;
  sourcePanel: ReactNode;
  languageLabel: string;
  sourceLabel: string;
  languageHint: string;
  sourceHint: string;
}) {
  const [mode, setMode] = useState<Mode>("language");

  return (
    <div>
      <div className="seg" role="tablist" aria-label="Search mode">
        <button
          role="tab"
          type="button"
          aria-selected={mode === "language"}
          aria-controls="panel-language"
          className="seg-btn"
          onClick={() => setMode("language")}
        >
          {languageLabel}
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={mode === "source"}
          aria-controls="panel-source"
          className="seg-btn"
          onClick={() => setMode("source")}
        >
          {sourceLabel}
        </button>
      </div>

      <p className="text-sm text-ink-soft mt-4 max-w-2xl leading-relaxed">
        {mode === "language" ? languageHint : sourceHint}
      </p>

      <div
        id="panel-language"
        role="tabpanel"
        hidden={mode !== "language"}
        className="mt-4"
      >
        {languagePanel}
      </div>
      <div
        id="panel-source"
        role="tabpanel"
        hidden={mode !== "source"}
        className="mt-4"
      >
        {sourcePanel}
      </div>
    </div>
  );
}
