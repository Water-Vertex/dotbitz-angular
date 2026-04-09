import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

@Component({
  selector: 'app-attempt-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-attempt.html',
  styleUrl: './assessment-attempt.css',
})
export class AttemptAssessment implements OnInit, OnDestroy {
  assignAssessmentId!: number;
  assessment: any = null;
  attempt: any = null;
  assignAssessment: any = null;
  questions: any[] = [];
  loading = true;
  submitting = false;

  answers: { [questionId: number]: string } = {};

  totalSeconds = 0;
  remainingSeconds = 0;
  timerInterval: any = null;

  showTimeUpModal = false;
  showSuccessModal = false;
  successData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentAttemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assignAssessmentId = Number(this.route.snapshot.paramMap.get('assignAssessmentId'));
    this.startAssessment();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // Helper to check if question is MCQ
  isMcq(q: any): boolean {
    const type = q?.assessment_type?.toLowerCase()?.trim();
    return type === 'mcq' || type === 'mcqs' || type === 'multiple_choice';
  }

  startAssessment(): void {
    this.loading = true;
    this.assessmentAttemptService.startAssessment(this.assignAssessmentId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.assessment = res.data.assessment;
          this.attempt = res.data.attempt;
          this.assignAssessment = res.data.assign_assessment;


          this.questions = (this.assessment?.questions || []).map((q: any) => {
            let parsedOptions = [];
            try {
              if (typeof q.options === 'string') {
                parsedOptions = JSON.parse(q.options);
              } else {
                parsedOptions = q.options || [];
              }
            } catch (e) {
              // Fallback: If it's a comma-separated string instead of JSON
              parsedOptions =
                q.options && typeof q.options === 'string' ? q.options.split(',') : [];
            }
            return { ...q, options: parsedOptions };
          });

          this.loading = false;
          this.initTimer();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          alert('You have already attempted this assessment.');
        } else {
          alert('Failed to start assessment.');
        }
        this.router.navigate(['/student/my-assessments']);
      },
    });
  }

  initTimer(): void {
    const minutes = this.assignAssessment?.time_to_complete || 30;
    this.totalSeconds = minutes * 60;
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
    return this.totalSeconds === 0 ? 0 : (this.remainingSeconds / this.totalSeconds) * 100;
  }

  get timerColor(): string {
    if (this.timerPercent > 50) return 'text-green-600';
    if (this.timerPercent > 25) return 'text-yellow-500';
    return 'text-red-600';
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onAnswerSelect(questionId: number, option: string): void {
    this.answers[questionId] = option;
  }

  isSelected(questionId: number, option: string): boolean {
    return this.answers[questionId] === option;
  }

  onWrittenAnswer(questionId: number, value: string): void {
    this.answers[questionId] = value;
  }

  onTimeUp(): void {
    this.showTimeUpModal = true;
    this.cdr.detectChanges();
    setTimeout(() => this.submitAssessment('time_up'), 3000);
  }

  onSubmit(): void {
    const answered = Object.keys(this.answers).length;
    const total = this.questions.length;
    if (answered < total) {
      if (!confirm(`You have ${total - answered} unanswered questions. Submit anyway?`)) return;
    }
    this.submitAssessment('completed');
  }

  submitAssessment(status: 'completed' | 'time_up'): void {
    if (this.submitting) return;
    this.submitting = true;
    this.clearTimer();

    const payload = {
      status,
      answers: this.questions.map((q: any) => ({
        question_id: q.id,
        student_answer: this.answers[q.id] || '',
      })),
    };

    this.assessmentAttemptService.submitAssessment(this.attempt.id, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.showTimeUpModal = false;
        this.successData = { ...res, status };
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to submit assessment.');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/student/my-assessments']);
  }
}
