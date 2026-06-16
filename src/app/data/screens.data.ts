import { ScreenConfig } from '../models/screen.model';
import screensManifest from '../../assets/screens.manifest.json';

export const SCREENS = screensManifest as ScreenConfig[];

export function getScreenBySlug(slug: string): ScreenConfig | undefined {
  return SCREENS.find((screen) => screen.slug === slug);
}
