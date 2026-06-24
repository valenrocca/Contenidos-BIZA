import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  readonly view = signal<QuizView>('question');
  readonly selectedDate = signal('');
  readonly errorMessage = signal('');
  readonly submitting = signal(false);
  readonly attempted = signal(false);
  readonly loading = signal(true);

  readonly contactEmail = environment.quizContactEmail;

  ngOnInit(): void {
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

  submit(): void {
    if (this.attempted() || this.loading()) {
      return;
    }

    const date = this.selectedDate().trim();
    if (!date) {
      this.errorMessage.set('Selecciona una fecha.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.quiz.submitAnswer(date).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.attempted.set(true);

        if (response.result === 'incorrect') {
          this.saveResult('incorrect');
          this.errorMessage.set('Fecha incorrecta.');
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
    const email = this.contactEmail || 'contact@example.com';
    return `mailto:${email}?subject=${encodeURIComponent('Biza quiz prize')}`;
  }

  private restoreLocalAttempt(): void {
    const saved = localStorage.getItem(QUIZ_RESULT_KEY) as QuizAnswerResult | null;
    if (!saved) {
      return;
    }

    this.attempted.set(true);

    if (saved === 'incorrect') {
      this.errorMessage.set('Fecha incorrecta.');
      return;
    }

    this.view.set(saved);
  }

  private saveResult(result: QuizAnswerResult): void {
    localStorage.setItem(QUIZ_RESULT_KEY, result);
    this.attempted.set(true);
  }
}
