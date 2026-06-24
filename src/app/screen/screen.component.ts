import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { AssetUrlService } from '../core/asset-url.service';
import { getScreenBySlug } from '../data/screens.data';

@Component({
  selector: 'app-screen',
  imports: [],
  templateUrl: './screen.component.html',
  styleUrl: './screen.component.scss',
})
export class ScreenComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly assetUrls = inject(AssetUrlService);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly screen = computed(() => {
    const slug = this.slug();
    return slug ? getScreenBySlug(slug) : undefined;
  });

  readonly assetUrl = computed(() => {
    const screen = this.screen();
    if (!screen) {
      return '';
    }
    if (screen.mediaProxy) {
      return screen.mediaProxy;
    }
    return this.assetUrls.mediaUrl(screen.src);
  });

  readonly posterUrl = computed(() => {
    const screen = this.screen();
    return screen?.poster ? this.assetUrls.mediaUrl(screen.poster) : undefined;
  });

  readonly isAudioPlaying = signal(false);

  toggleAudio(audio: HTMLAudioElement): void {
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  onAudioPlayState(playing: boolean): void {
    this.isAudioPlaying.set(playing);
  }
}
