import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from './api-url';

export type QuizAnswerResult = 'incorrect' | 'winner' | 'late';

export interface QuizAnswerResponse {
  result?: QuizAnswerResult;
  closed?: boolean;
  error?: string;
}

export interface QuizStatusResponse {
  closed: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);

  getStatus(): Observable<QuizStatusResponse> {
    return this.http.get<QuizStatusResponse>(apiUrl('/api/quiz/status'));
  }

  submitAnswer(date: string): Observable<QuizAnswerResponse> {
    return this.http.post<QuizAnswerResponse>(apiUrl('/api/quiz/answer'), { date });
  }

  reset(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/api/quiz/reset'), {});
  }
}
