import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

@Component({
  selector: 'app-student-assessment-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-view.html',
  styleUrls: ['./assessment-view.css'],
})
export class StudentAssessmentView implements OnInit, OnDestroy {
  attemptId!: number;
  attemptData: any = null;
  loading: boolean = true;
  correctCount: number = 0;
  wrongCount: number = 0;
  totalMcqMarks: number = 0;
  totalQnaMarks: number = 0;
  obtainedMcqMarks: number = 0;
  obtainedQnaMarks: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.attemptId = Number(idParam);
    if (this.attemptId) {
      this.fetchAttempt();
    } else {
      this.loading = false;
    }
  }

  fetchAttempt(): void {
    this.loading = true;
    this.attemptService.viewAttempt(this.attemptId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log('Assessment View Response:', res);

          let responseData = res;
          if (res && res.data) {
            responseData = res.data;
          }

          this.attemptData = responseData;

          // Initialize counters
          this.correctCount = 0;
          this.wrongCount = 0;
          this.totalMcqMarks = 0;
          this.totalQnaMarks = 0;
          this.obtainedMcqMarks = 0;
          this.obtainedQnaMarks = 0;

          if (this.attemptData?.answers) {
            this.attemptData.answers.forEach((a: any) => {
              if (a.assessment_type === 'mcqs') {
                this.totalMcqMarks += Number(a.marks) || 0;
                if (a.is_correct === 1) {
                  this.correctCount++;
                  this.obtainedMcqMarks += Number(a.marks) || 0;
                } else {
                  this.wrongCount++;
                }
              } else if (a.assessment_type === 'q-a') {
                this.totalQnaMarks += Number(a.marks) || 0;
                const obtainedMarks = Number(a.is_correct) || 0;
                this.obtainedQnaMarks += obtainedMarks;

                if (obtainedMarks > 0) {
                  this.correctCount++;
                } else {
                  this.wrongCount++;
                }
              }
            });
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Fetch error:', err);
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  getQuestionTypeClass(question: any): string {
    return question.assessment_type === 'mcqs' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';
  }

  getQuestionTypeText(question: any): string {
    return question.assessment_type === 'mcqs' ? 'MCQ' : 'Q&A';
  }

  getStatusClass(answer: any): string {
    if (answer.assessment_type === 'mcqs') {
      return answer.is_correct === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    } else {
      const obtainedMarks = Number(answer.is_correct) || 0;
      const totalMarks = Number(answer.marks) || 0;
      if (obtainedMarks === 0) return 'bg-red-100 text-red-700';
      if (obtainedMarks === totalMarks) return 'bg-green-100 text-green-700';
      return 'bg-yellow-100 text-yellow-700';
    }
  }

  getStatusText(answer: any): string {
    if (answer.assessment_type === 'mcqs') {
      return answer.is_correct === 1 ? 'Correct' : 'Wrong';
    } else {
      const obtainedMarks = Number(answer.is_correct) || 0;
      const totalMarks = Number(answer.marks) || 0;
      if (obtainedMarks === 0) return 'Wrong';
      if (obtainedMarks === totalMarks) return 'Correct';
      return `Partial (${obtainedMarks}/${totalMarks})`;
    }
  }

  getObtainedMarks(answer: any): number {
    if (answer.assessment_type === 'mcqs') {
      return answer.is_correct === 1 ? Number(answer.marks) || 0 : 0;
    } else {
      return Number(answer.is_correct) || 0;
    }
  }

  getTotalMarks(answer: any): number {
    return Number(answer.marks) || 0;
  }

  isFullMarks(answer: any): boolean {
    return this.getObtainedMarks(answer) === this.getTotalMarks(answer);
  }

  isPartialMarks(answer: any): boolean {
    const obtained = this.getObtainedMarks(answer);
    const total = this.getTotalMarks(answer);
    return obtained > 0 && obtained < total;
  }

  getMarksColorClass(answer: any): string {
    if (this.isFullMarks(answer)) return 'text-green-600';
    if (this.isPartialMarks(answer)) return 'text-yellow-600';
    return 'text-red-600';
  }

  formatOptions(options: any): string[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch(e) {
        return options.split(',').map((opt: string) => opt.trim());
      }
    }
    return [];
  }

  get totalObtainedMarks(): number {
    return this.obtainedMcqMarks + this.obtainedQnaMarks;
  }

  get totalPossibleMarks(): number {
    return this.totalMcqMarks + this.totalQnaMarks;
  }

  goBack(): void {
    this.router.navigate(['/student/my-assessments']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
