import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
    return this.http.get<QuizStatusResponse>('/api/quiz/status');
  }

  submitAnswer(date: string): Observable<QuizAnswerResponse> {
    return this.http.post<QuizAnswerResponse>('/api/quiz/answer', { date });
  }
}
