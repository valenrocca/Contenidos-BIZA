import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { QuizAnswerResult, QuizService } from '../core/quiz.service';

type QuizView = 'question' | QuizAnswerResult;

interface QuizLocalState {
  result?: Exclude<QuizAnswerResult, 'incorrect'>;
  attemptsUsed?: number;
}

const QUIZ_STATE_KEY = 'biza-quiz-state';

@Component({
  selector: 'app-quiz',
  imports: [FormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent implements OnInit {
  private readonly quiz = inject(QuizService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly view = signal<QuizView>('question');
  readonly selectedDate = signal('');
  readonly selectedHours = signal('');
  readonly selectedMinutes = signal('');
  readonly selectedSeconds = signal('');
  readonly errorMessage = signal('');
  readonly submitting = signal(false);
  readonly loading = signal(true);
  readonly termsAccepted = signal(false);
  readonly attemptsUsed = signal(0);
  readonly maxAttempts = signal(1);
  readonly attemptsRemaining = signal(1);

  readonly contactEmail = environment.quizContactEmail;
  readonly termsPdfUrl = environment.quizTermsPdfUrl;

  ngOnInit(): void {
    // Quiz desactivado: solo se muestra la vista "averiguaste tarde".
    this.view.set('late');
    this.loading.set(false);
  }

  submit(): void {
    if (this.loading() || this.submitting() || this.view() !== 'question' || this.attemptsRemaining() <= 0) {
      return;
    }

    const date = this.selectedDate().trim();
    const hours = this.readTimePart(this.selectedHours());
    const minutes = this.readTimePart(this.selectedMinutes());
    const seconds = this.readTimePart(this.selectedSeconds());

    if (!date) {
      this.errorMessage.set('Selecciona una fecha.');
      return;
    }

    if (hours === null || minutes === null || seconds === null) {
      this.errorMessage.set('Completá hora, minutos y segundos.');
      return;
    }

    const timeParts = { hours, minutes, seconds };

    if (
      !Number.isInteger(timeParts.hours) ||
      !Number.isInteger(timeParts.minutes) ||
      !Number.isInteger(timeParts.seconds) ||
      timeParts.hours < 0 ||
      timeParts.hours > 23 ||
      timeParts.minutes < 0 ||
      timeParts.minutes > 59 ||
      timeParts.seconds < 0 ||
      timeParts.seconds > 59
    ) {
      this.errorMessage.set('La hora ingresada no es válida.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.quiz.submitAnswer({ date, ...timeParts }).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.applyAttemptStatus(response);

        if (response.result === 'incorrect') {
          this.errorMessage.set(
            response.reason === 'time' ? 'Hora incorrecta averigua bien' : 'Fecha incorrecta.',
          );
          return;
        }

        if (response.result === 'winner' || response.result === 'late') {
          this.saveResult(response.result);
          this.view.set(response.result);
        }
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Algo salió mal. Inténtalo de nuevo.');
      },
    });
  }

  contactHref(): string {
    const email = this.contactEmail || 'contacto.bizarrap@daleplay.la';
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: email,
      su: '42',
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  private resetQuizForDev(): void {
    localStorage.removeItem(QUIZ_STATE_KEY);
    this.view.set('question');
    this.selectedDate.set('');
    this.selectedHours.set('');
    this.selectedMinutes.set('');
    this.selectedSeconds.set('');
    this.errorMessage.set('');
    this.submitting.set(false);
    this.termsAccepted.set(false);
    this.attemptsUsed.set(0);
    this.maxAttempts.set(1);
    this.attemptsRemaining.set(1);
    this.loading.set(true);

    this.quiz.reset().subscribe({
      next: () => {
        void this.router.navigate(['/quiz'], { replaceUrl: true });
        this.loadQuiz();
      },
      error: () => {
        this.errorMessage.set('Reiniciá el servidor API: npm run start:api');
        this.loading.set(false);
      },
    });
  }

  private loadQuiz(): void {
    this.loading.set(true);

    this.quiz.getStatus().subscribe({
      next: (status) => {
        this.applyAttemptStatus(status);

        if (status.closed) {
          this.saveResult('late');
          this.view.set('late');
          this.loading.set(false);
          return;
        }

        if (status.attemptsExceeded) {
          this.saveResult('late');
          this.view.set('late');
          this.loading.set(false);
          return;
        }

        this.restoreLocalState();
        this.loading.set(false);
      },
      error: () => {
        this.restoreLocalState();
        this.loading.set(false);
      },
    });
  }

  private restoreLocalState(): void {
    const saved = this.readLocalState();
    if (!saved?.result) {
      return;
    }

    this.view.set(saved.result);
  }

  private saveResult(result: Exclude<QuizAnswerResult, 'incorrect'>): void {
    const state: QuizLocalState = {
      result,
      attemptsUsed: this.attemptsUsed(),
    };
    localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
  }

  private readLocalState(): QuizLocalState | null {
    const raw = localStorage.getItem(QUIZ_STATE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as QuizLocalState;
    } catch {
      return null;
    }
  }

  private applyAttemptStatus(status: {
    attemptsUsed?: number;
    maxAttempts?: number;
    attemptsRemaining?: number;
    attemptsExceeded?: boolean;
  }): void {
    const maxAttempts = status.maxAttempts ?? this.maxAttempts();
    const attemptsUsed = status.attemptsUsed ?? this.attemptsUsed();
    const attemptsRemaining =
      status.attemptsRemaining ?? Math.max(0, maxAttempts - attemptsUsed);

    this.maxAttempts.set(maxAttempts);
    this.attemptsUsed.set(attemptsUsed);
    this.attemptsRemaining.set(status.attemptsExceeded ? 0 : attemptsRemaining);
  }

  private readTimePart(value: string | number | null | undefined): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const num = Number(value);
    return Number.isInteger(num) ? num : null;
  }
}
