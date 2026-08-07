/**
 * Optional display-name overrides, keyed by the language code used in the
 * snapshot files (lowercased).
 *
 * Sources disagree about names for the same language ("Farsi" vs "Persian",
 * "Tagalog" vs "Filipino"), and whichever source loads first would otherwise
 * win by accident. Anything listed here wins over every source's own name, so
 * one language reads the same on every card.
 *
 * Leave empty until a disagreement actually shows up.
 */
export const LANGUAGE_NAME_OVERRIDES: Record<string, string> = {
  // fas: "Persian",
};
