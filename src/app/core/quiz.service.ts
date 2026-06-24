import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl } from './api-url';

export type QuizAnswerResult = 'incorrect' | 'winner' | 'late';

export interface QuizAnswerResponse {
  result?: QuizAnswerResult;
  reason?: 'date' | 'time';
  closed?: boolean;
  error?: string;
}

export interface QuizStatusResponse {
  closed: boolean;
  error?: string;
}

export interface QuizAnswerPayload {
  date: string;
  hours: number;
  minutes: number;
  seconds: number;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);

  getStatus(): Observable<QuizStatusResponse> {
    return this.http.get<QuizStatusResponse>(apiUrl('/api/quiz/status'));
  }

  submitAnswer(payload: QuizAnswerPayload): Observable<QuizAnswerResponse> {
    return this.http.post<QuizAnswerResponse>(apiUrl('/api/quiz/answer'), payload);
  }

  reset(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/api/quiz/reset'), {});
  }
}
