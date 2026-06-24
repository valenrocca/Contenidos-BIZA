import { Component } from '@angular/core';

import { COUNTRY_LINKS } from './gorra.data';

@Component({
  selector: 'app-gorra',
  imports: [],
  templateUrl: './gorra.component.html',
  styleUrl: './gorra.component.scss',
})
export class GorraComponent {
  readonly countries = COUNTRY_LINKS;
}
