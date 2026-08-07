import { CATEGORY } from "@/config/category";

/**
 * Thin strip above every page holding the way back out of this category app.
 * Renders nothing when no parent link is configured, so a standalone
 * deployment does not carry a dead bar.
 */
export function TopBar() {
  const link = CATEGORY.parentLink;
  if (!link) return null;

  return (
    <div className="border-b border-line px-6 py-2 text-sm">
      {/* Plain <a>, not <Link>: the portal is a different Next.js app, so
          crossing back to it must be a full page load. */}
      <a href={link.href} className="text-ink-soft hover:text-ink">
        {link.label}
      </a>
    </div>
  );
}
