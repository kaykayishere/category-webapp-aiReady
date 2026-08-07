/**
 * ===========================================================================
 * EDIT THIS FILE FIRST when starting a new category app.
 * ===========================================================================
 *
 * Everything user-visible about *which* category this app covers lives here.
 * No page or component hardcodes a category name, a subject area, or a data
 * source -- they all read from this file and from `./sources.ts`. Copying this
 * folder and rewriting these two files is the whole setup.
 */
export interface CategoryConfig {
  /** Page title / <h1>. Keep it short -- it is set in large display type. */
  title: string;
  /** One line under the title saying what this layer of the system covers. */
  tagline: string;
  /**
   * Word used for a single tracked entity in copy, e.g. "data source". The
   * plural is used in headings like "3 data sources". Change only if another
   * word reads better for your category.
   */
  sourceNoun: { singular: string; plural: string };
  /** Shown in the footer next to the snapshot list. */
  footerNote: string;
  /** Optional "← back" link to the portal this app is a zone of. */
  parentLink?: { label: string; href: string };
  /** <meta> description. */
  description: string;
}

export const CATEGORY: CategoryConfig = {
  title: "Category name",
  tagline:
    "Placeholder tagline: one sentence describing the meta-category this layer covers and what a reader can compare across its data sources.",
  sourceNoun: { singular: "data source", plural: "data sources" },
  footerNote: "Placeholder footer note — replace with attribution for this category.",
  parentLink: {
    // Absolute URL, not "/" -- this app is reachable directly as well as
    // through the portal's proxy, and "/" would resolve back to itself.
    label: "← Portal",
    href: "https://example.com/",
  },
  description:
    "Placeholder description for this category: language coverage across its data sources.",
};
