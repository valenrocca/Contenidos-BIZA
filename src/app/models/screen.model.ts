export type ScreenMediaType = 'image' | 'video' | 'audio';

export interface ScreenConfig {
  slug: string;
  type: ScreenMediaType;
  src: string;
  alt?: string;
  /** Optional poster image for videos (relative to CDN root, e.g. images/screen-02-poster.webp). */
  poster?: string;
}
