import Link from "next/link";
import { CATEGORY } from "@/config/category";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-4xl mt-3">Nothing here</h1>
        <p className="text-ink-soft mt-3 max-w-md leading-relaxed">
          That page is not part of {CATEGORY.title}. It may be a{" "}
          {CATEGORY.sourceNoun.singular} that is no longer registered.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Back to {CATEGORY.title}
        </Link>
      </div>
    </main>
  );
}
