export interface CategoryConfig {
  title: string;
  tagline: string;
  sourceNoun: { singular: string; plural: string };
  footerNote: string;
  parentLink?: { label: string; href: string };
  description: string;
}

export const CATEGORY: CategoryConfig = {
  title: "AI Readiness",
  tagline: "Models, datasets, and evaluation benchmarks that show whether a language is trainable and evaluable for AI.",
  sourceNoun: { singular: "data source", plural: "data sources" },
  footerNote: "AI Readiness meta-category in IDLI — coverage of models, datasets, and benchmarks.",
  parentLink: {
    label: "← IDLI Portal",
    href: "https://example.com/",
  },
  description: "AI readiness signals across languages: model availability, datasets, translation, classification, reading comprehension, knowledge, and speech.",
};
