export interface SourceConfig {
  id: string;
  name: string;
  blurb: string;
  appUrl?: string;
  tags?: string[];
}

export const SOURCES: SourceConfig[] = [
  {
  id: "hf-models",
  name: "Hugging Face Hub (models)",
  blurb: "Language-tagged models on the Hub. Counts need careful filtering and deduplication.",
  appUrl: "https://huggingface.co/models",
  tags: ["models", "Hub"],
},
{
  id: "hf-datasets",
  name: "Hugging Face Hub (datasets)",
  blurb: "Language-tagged datasets on the Hub. Strong signal that a language is trainable.",
  appUrl: "https://huggingface.co/datasets",
  tags: ["datasets", "Hub"],
},
  {
    id: "nllb-200",
    name: "NLLB-200",
    blurb: "Meta's No Language Left Behind translation models covering ~200 languages (FLORES-aligned).",
    appUrl: "https://huggingface.co/facebook/nllb-200-distilled-600M",
    tags: ["translation", "Meta"],
  },
  {
    id: "flores-200",
    name: "FLORES-200",
    blurb: "Evaluation benchmark for ~200 languages — the de facto baseline for whether a language is evaluable at all.",
    appUrl: "https://github.com/facebookresearch/flores",
    tags: ["benchmark", "MT"],
  },
  {
    id: "sib-200",
    name: "SIB-200",
    blurb: "Topic classification benchmark across ~200 languages; among the widest eval coverage available.",
    appUrl: "https://huggingface.co/datasets/Davlan/sib200",
    tags: ["benchmark", "classification"],
  },
  {
    id: "belebele",
    name: "Belebele",
    blurb: "Reading comprehension across 100+ language variants. Presence means evaluable, not merely trainable.",
    appUrl: "https://huggingface.co/datasets/facebook/belebele",
    tags: ["benchmark", "QA"],
  },
  {
    id: "global-mmlu",
    name: "Global-MMLU",
    blurb: "Knowledge evaluation (MMLU-style) in 42 languages from Cohere For AI.",
    appUrl: "https://huggingface.co/datasets/CohereForAI/Global-MMLU",
    tags: ["benchmark", "knowledge"],
  },
  {
    id: "mms",
    name: "MMS",
    blurb: "Massively Multilingual Speech — 1000+ ASR and 1100+ TTS languages (Meta). Strong speech signal.",
    appUrl: "https://huggingface.co/facebook/mms-1b-all",
    tags: ["speech", "ASR", "TTS"],
  },
];

export function findSource(id: string): SourceConfig | undefined {
  return SOURCES.find((s) => s.id === id);
}
