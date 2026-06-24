import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssetUrlService {
  private readonly mediaBase = environment.mediaCdnUrl.replace(/\/$/, '');

  /** Resolves screen media (images/videos/audio) from R2 CDN or local /assets fallback. */
  mediaUrl(relativePath: string): string {
    const path = relativePath.replace(/^\//, '');
    const encodedPath = path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return this.mediaBase ? `${this.mediaBase}/${encodedPath}` : `/assets/${encodedPath}`;
  }

  /** Origin for preconnect/dns-prefetch when media is served from an external CDN. */
  get mediaOrigin(): string | null {
    if (!this.mediaBase) {
      return null;
    }
    try {
      return new URL(this.mediaBase).origin;
    } catch {
      return null;
    }
  }
}
