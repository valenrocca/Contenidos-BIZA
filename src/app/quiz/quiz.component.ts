import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { QuizAnswerResult, QuizService } from '../core/quiz.service';

type QuizView = 'question' | QuizAnswerResult;

const QUIZ_RESULT_KEY = 'biza-quiz-result';

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
  readonly attempted = signal(false);
  readonly loading = signal(true);

  readonly contactEmail = environment.quizContactEmail;

  ngOnInit(): void {
    if (!environment.production && this.route.snapshot.queryParamMap.get('reset') === '1') {
      this.resetQuizForDev();
      return;
    }

    this.loadQuiz();
  }

  submit(): void {
    if (this.attempted() || this.loading()) {
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
        this.attempted.set(true);

        if (response.result === 'incorrect') {
          this.saveResult('incorrect');
          this.errorMessage.set(
            response.reason === 'time' ? 'Hora incorrecta.' : 'Fecha incorrecta.',
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
    localStorage.removeItem(QUIZ_RESULT_KEY);
    this.view.set('question');
    this.selectedDate.set('');
    this.selectedHours.set('');
    this.selectedMinutes.set('');
    this.selectedSeconds.set('');
    this.errorMessage.set('');
    this.submitting.set(false);
    this.attempted.set(false);
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
        if (status.closed) {
          this.saveResult('late');
          this.view.set('late');
          this.loading.set(false);
          return;
        }

        this.restoreLocalAttempt();
        this.loading.set(false);
      },
      error: () => {
        this.restoreLocalAttempt();
        this.loading.set(false);
      },
    });
  }

  private restoreLocalAttempt(): void {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY) as QuizAnswerResult | null;
    if (!saved) {
      return;
    }

    this.attempted.set(true);

    if (saved === 'incorrect') {
      this.errorMessage.set('Respuesta incorrecta.');
      return;
    }

    this.view.set(saved);
  }

  private saveResult(result: QuizAnswerResult): void {
    localStorage.setItem(QUIZ_RESULT_KEY, result);
    this.attempted.set(true);
  }

  private readTimePart(value: string | number | null | undefined): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const num = Number(value);
    return Number.isInteger(num) ? num : null;
  }
}
