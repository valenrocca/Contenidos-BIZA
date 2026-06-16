export type ScreenMediaType = 'image' | 'video';

export interface ScreenConfig {
  slug: string;
  type: ScreenMediaType;
  src: string;
  alt?: string;
}
