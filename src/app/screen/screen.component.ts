import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { getScreenBySlug } from '../data/screens.data';

@Component({
  selector: 'app-screen',
  imports: [],
  templateUrl: './screen.component.html',
  styleUrl: './screen.component.scss',
})
export class ScreenComponent {
  private readonly route = inject(ActivatedRoute);

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
    return screen ? `/assets/${screen.src}` : '';
  });
}
