import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../../../services/course.service';

@Component({
  selector: 'my-quiz',
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
  isResume = false;

  answers: { [mcqId: number]: string } = {};

  totalSeconds = 0;
  remainingSeconds = 0;
  timerInterval: any = null;
  timerStartTime: number = 0;

  showTimeUpModal = false;
  showSuccessModal = false;
  successData: any = null;

  isOverdueAttempt = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.startOrResumeQuiz();
  }

  ngOnDestroy(): void {
    this.clearTimer();
    // ✅ Auto-save on destroy (tab change/close)
    this.autoSaveAnswers();
  }

  // ✅ Browser close/tab change detect
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: any): void {
    this.autoSaveAnswers();
  }

@HostListener('document:visibilitychange')
onVisibilityChange(): void {
  if (document.hidden) {
    this.autoSaveAnswers();
  }
}

  autoSaveAnswers(): void {
    if (!this.attempt || !this.quiz || this.submitting) return;
    if (Object.keys(this.answers).length === 0) return;

    const answersPayload = (this.quiz?.mcqs || []).map((mcq: any) => ({
      mcq_id:         mcq.id,
      student_answer: this.answers[mcq.id] || '',
    }));

    // Save to localStorage as backup
    localStorage.setItem(
      `quiz_answers_${this.attempt.id}`,
      JSON.stringify({
        answers:          this.answers,
        remainingSeconds: this.remainingSeconds,
        savedAt:          Date.now(),
      })
    );

    // Also save to server
    this.courseService.saveQuizProgress(this.attempt.id, answersPayload).subscribe({
      next: () => {},
      error: () => {}
    });
  }

startOrResumeQuiz(): void {
  this.loading = true;
  this.courseService.startQuiz(this.quizId).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.quiz             = res.data.quiz;
        this.attempt          = res.data.attempt;
        this.isResume         = res.is_resume || false;
        this.isOverdueAttempt = res.data.attempt?.is_overdue || false;
        this.loading          = false;

        const isReattempt = res.data.attempt?.is_reattempt || false;

        // ✅ Reattempt hai — localStorage poora clear karo
        if (isReattempt) {
          localStorage.removeItem(`quiz_answers_${this.attempt.id}`);
          localStorage.removeItem(`quiz_${this.quizId}_timer`);
          localStorage.removeItem(`quiz_${this.quizId}_remaining`);
          localStorage.removeItem(`quiz_${this.quizId}_answers`);
          localStorage.removeItem(`quiz_attempt_${this.quizId}`);

          // ✅ Fresh answers
          this.answers          = {};
          // ✅ isResume false karo taake fresh timer mile
          this.isResume         = false;
          this.remainingSeconds = (this.quiz.duration || 30) * 60;

        } else if (this.isResume) {
          // Normal resume — saved answers load karo
          this.loadSavedAnswers();
        }

        this.initTimer();
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      this.loading = false;
      if (err.status === 409) {
        alert('You have already attempted this quiz.');
      } else if (err.status === 403) {
        alert(err.error?.message || 'Quiz deadline has passed.');
      } else {
        alert('Failed to start quiz.');
      }
      this.router.navigate(['/student/my-courses']);
    }
  });
}
  loadSavedAnswers(): void {
    // Load from localStorage first (faster)
    const saved = localStorage.getItem(`quiz_answers_${this.attempt.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.answers = parsed.answers || {};

        // Timer restore karo agar localStorage mein saved hai
        if (parsed.remainingSeconds && parsed.savedAt) {
          const elapsed = Math.floor((Date.now() - parsed.savedAt) / 1000);
          this.remainingSeconds = Math.max(0, parsed.remainingSeconds - elapsed);
        }
      } catch (e) {}
    }

    // Server se bhi load karo
    this.courseService.resumeQuizCheck(this.quizId).subscribe({
      next: (res: any) => {
        if (res.success && res.data.savedAnswers) {
          const serverAnswers = res.data.savedAnswers;
          // Server answers se merge karo
          Object.keys(serverAnswers).forEach(mcqId => {
            if (serverAnswers[mcqId]) {
              this.answers[Number(mcqId)] = serverAnswers[mcqId];
            }
          });
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

initTimer(): void {
  const totalSecs   = (this.quiz.duration || 30) * 60;
  this.totalSeconds = totalSecs;

  // ✅ Agar remainingSeconds pehle se set hai (reattempt case) — use karo
  if (this.remainingSeconds > 0 && this.remainingSeconds <= totalSecs) {
    // Already set — kuch mat karo
  } else if (this.isResume && this.remainingSeconds > 0) {
    // localStorage se restore hua
  } else if (this.isResume && this.attempt?.created_at) {
    const startTime       = new Date(this.attempt.created_at).getTime();
    const elapsed         = Math.floor((Date.now() - startTime) / 1000);
    this.remainingSeconds = Math.max(0, totalSecs - elapsed);
  } else {
    // Fresh start
    this.remainingSeconds = totalSecs;
  }

  if (this.remainingSeconds <= 0) {
    this.onTimeUp();
    return;
  }

  this.timerInterval = setInterval(() => {
    this.remainingSeconds--;
    this.cdr.detectChanges();

    if (this.remainingSeconds % 30 === 0) {
      this.autoSaveAnswers();
    }

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

    const payload = { answers: answersPayload, status };

    this.courseService.submitQuiz(this.attempt.id, payload).subscribe({
      next: (res: any) => {
        // Clear localStorage
        localStorage.removeItem(`quiz_answers_${this.attempt.id}`);

        this.submitting      = false;
        this.showTimeUpModal = false;
        this.successData     = res;
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        alert('Failed to submit quiz.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/my-courses']);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}






