import { Routes } from '@angular/router';

import { GorraComponent } from './gorra/gorra.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { QuizComponent } from './quiz/quiz.component';
import { ScreenComponent } from './screen/screen.component';

export const routes: Routes = [
  { path: 'quiz', component: QuizComponent },
  { path: 'gorra', component: GorraComponent },
  { path: ':slug', component: ScreenComponent },
  { path: '**', component: NotFoundComponent },
];
