export type ScreenMediaType = 'image' | 'video' | 'audio';

export interface ScreenHotspot {
  url: string;
  top: string;
  left: string;
  width: string;
  height: string;
  label?: string;
  /** Position offset applied with translateY for responsive nudges. */
  offsetY?: string;
}

export interface ScreenConfig {
  slug: string;
  type: ScreenMediaType;
  src: string;
  alt?: string;
  /** Optional poster image for videos (relative to CDN root, e.g. images/screen-02-poster.webp). */
  poster?: string;
  /** Optional same-origin proxy path when CDN file needs server-side conversion. */
  mediaProxy?: string;
  /** Optional invisible click area over part of an image. */
  hotspot?: ScreenHotspot;
}
