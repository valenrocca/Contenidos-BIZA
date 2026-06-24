import { ScreenConfig } from '../models/screen.model';
import screensManifest from './screens.manifest.json';

export const SCREENS = screensManifest as ScreenConfig[];

const SCREENS_BY_SLUG = new Map(SCREENS.map((screen) => [screen.slug, screen]));

export function getScreenBySlug(slug: string): ScreenConfig | undefined {
  return SCREENS_BY_SLUG.get(slug);
}
