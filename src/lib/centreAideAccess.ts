import { guideGroups, type Guide } from "@/lib/centreAideData";

/** Public title/route, but not the protected guide description. */
export const guideDescriptionPath = (slug: string) => `/centre-aide/guide/${slug}`;

/** Clicking a locked guide must authenticate BEFORE opening its description. */
export function guideAccessHref(
  guide: Pick<Guide, "slug" | "requiresAuth">,
  hasPlatformAccess: boolean,
): string {
  const descriptionPath = guideDescriptionPath(guide.slug);
  return guide.requiresAuth && !hasPlatformAccess
    ? `/login?next=${encodeURIComponent(descriptionPath)}`
    : descriptionPath;
}

/** Narrowly allow a post-login return to known protected help pages. */
export function isProtectedGuidePath(path: string): boolean {
  const match = /^\/centre-aide\/guide\/([a-z0-9-]+)$/.exec(path);
  return !!match && guideGroups.some(group =>
    group.guides.some(guide => guide.requiresAuth && guide.slug === match[1])
  );
}
