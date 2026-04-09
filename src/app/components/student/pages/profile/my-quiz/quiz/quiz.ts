import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../../../services/course.service';

@Component({
  selector: 'app-my-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.html',
})
export class MyQuiz implements OnInit, OnDestroy {

  quizId!: number;
  quiz: any = null;
  attempt: any = null;
  loading = true;
  submitting = false;

  // Answers — mcq_id → student_answer
  answers: { [mcqId: number]: string } = {};
objectKeys(obj: any): string[] {
  return Object.keys(obj);
}
  // Timer
  totalSeconds = 0;
  remainingSeconds = 0;
  timerInterval: any = null;

  // Modals
  showTimeUpModal = false;
  showSuccessModal = false;
  successData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.startQuiz();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  startQuiz(): void {
    this.loading = true;
    this.courseService.startQuiz(this.quizId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.quiz    = res.data.quiz;
          this.attempt = res.data.attempt;
          this.loading = false;
          this.initTimer();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          alert('You have already attempted this quiz.');
        } else if (err.status === 403) {
          alert('Due date has passed. You cannot attempt this quiz.');
        } else {
          alert('Failed to start quiz.');
        }
        this.router.navigate(['/student/my-courses']);
      }
    });
  }

  initTimer(): void {
    this.totalSeconds     = (this.quiz.duration || 30) * 60;
    this.remainingSeconds = this.totalSeconds;

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.cdr.detectChanges();

      if (this.remainingSeconds <= 0) {
        this.clearTimer();
        this.onTimeUp();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get timerDisplay(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get timerPercent(): number {
    if (this.totalSeconds === 0) return 0;
    return (this.remainingSeconds / this.totalSeconds) * 100;
  }

  get timerColor(): string {
    if (this.timerPercent > 50) return 'text-green-600';
    if (this.timerPercent > 25) return 'text-yellow-500';
    return 'text-red-600';
  }

  onAnswerSelect(mcqId: number, option: string): void {
    this.answers[mcqId] = option;
  }

  isSelected(mcqId: number, option: string): boolean {
    return this.answers[mcqId] === option;
  }

  onTimeUp(): void {
    this.showTimeUpModal = true;
    this.cdr.detectChanges();
    // Auto submit after 3 seconds
    setTimeout(() => {
      this.submitQuiz('time_up');
    }, 3000);
  }

  onSubmit(): void {
    const answered = Object.keys(this.answers).length;
    const total    = this.quiz?.mcqs?.length || 0;

    if (answered < total) {
      const unanswered = total - answered;
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    this.submitQuiz('completed');
  }

  submitQuiz(status: 'completed' | 'time_up'): void {
    if (this.submitting) return;
    this.submitting = true;
    this.clearTimer();

    const answersPayload = (this.quiz?.mcqs || []).map((mcq: any) => ({
      mcq_id:         mcq.id,
      student_answer: this.answers[mcq.id] || '',
    }));

    const payload = {
      answers: answersPayload,
      status:  status,
    };

    this.courseService.submitQuiz(this.attempt.id, payload).subscribe({
      next: (res: any) => {
        this.submitting     = false;
        this.showTimeUpModal = false;
        this.successData    = res;
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        alert('Failed to submit quiz. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/my-courses']);
  }
}
