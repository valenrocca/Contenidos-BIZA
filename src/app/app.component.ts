import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AssetUrlService } from './core/asset-url.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly assetUrls = inject(AssetUrlService);

  ngOnInit(): void {
    const origin = this.assetUrls.mediaOrigin;
    if (!origin) {
      return;
    }

    for (const rel of ['preconnect', 'dns-prefetch'] as const) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = origin;
      if (rel === 'preconnect') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    }
  }
}
