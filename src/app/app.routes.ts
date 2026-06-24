import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';
import { QuizComponent } from './quiz/quiz.component';
import { ScreenComponent } from './screen/screen.component';

export const routes: Routes = [
  { path: 'quiz', component: QuizComponent },
  { path: ':slug', component: ScreenComponent },
  { path: '**', component: NotFoundComponent },
];
