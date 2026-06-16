import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';
import { ScreenComponent } from './screen/screen.component';

export const routes: Routes = [
  { path: ':slug', component: ScreenComponent },
  { path: '**', component: NotFoundComponent },
];
