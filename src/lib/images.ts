/**
 * Detects "generic" thumbnails: site logos and default share images that a
 * publisher attaches to every post (e.g. arXiv's logo was on 2,300+ papers).
 * Those say nothing about the story, so we drop them and render a designed
 * cover instead (see ArticleCover).
 */
const GENERIC_PATTERNS: RegExp[] = [
  /arxiv\.org\/static\//i,
  // A file that *is* a logo ("site-logo.png", "arxiv-logo-fb.png") — but not an
  // editorial photo that merely shows one ("OpenAI-logo-in-Seoul.jpg").
  /\/(?:[\w-]*[-_])?logo(?:[-_](?:fb|og|share|social|default|white|black|dark|light|square|\d+x\d+))?\.(?:png|jpe?g|svg|webp|gif)(?:$|\?)/i,
  /favicon|apple-touch-icon/i,
  /\/(?:[\w-]*[-_])?(?:default|fallback|placeholder)(?:[-_][\w-]*)?\.(?:png|jpe?g|svg|webp)(?:$|\?)/i,
  /\/(?:og|social|share)[-_](?:default|image|card)\.(?:png|jpe?g|webp)/i,
];

export function isGenericImage(url: string | null | undefined): boolean {
  if (!url) return false;
  return GENERIC_PATTERNS.some((re) => re.test(url));
}

/** The thumbnail to show, or null when it is missing or generic. */
export function usableThumbnail(url: string | null | undefined): string | null {
  return url && !isGenericImage(url) ? url : null;
}
