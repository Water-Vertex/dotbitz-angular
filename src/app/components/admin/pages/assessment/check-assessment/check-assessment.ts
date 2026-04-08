import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentAttemptService } from '../../../../../services/assessment-attempt.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-check-assessment',
  standalone: true,
  templateUrl: './check-assessment.html',
  styleUrls: ['./check-assessment.css'],
  imports: [CommonModule, FormsModule],
})
export class CheckAssessment implements OnInit {
  attemptId!: number;
  attemptData: any = null;
  loading: boolean = true;
  submitting: boolean = false;
  adminRemarks: string = '';
  answers: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialize component and capture the attempt ID from route parameters.
   */
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.attemptId = +params['id'];
      if (this.attemptId) {
        this.fetchAttempt();
      }
    });
  }

  /**
   * Fetch attempt details and initialize the answer status object.
   */
  fetchAttempt(): void {
    this.loading = true;
    this.attemptService.getAttemptById(this.attemptId).subscribe({
      next: (res: any) => {
        this.attemptData = res.data || res;
        this.adminRemarks = '';

        if (this.attemptData.answers) {
          this.attemptData.answers.forEach((a: any) => {
            if (a.is_correct !== null && a.is_correct !== undefined) {
              this.answers[a.question_id] = a.is_correct == 1;
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

  /**
   * Set the correctness status for a specific question.
   */
  setAnswer(questionId: number, isCorrect: boolean): void {
    this.answers[questionId] = isCorrect;
    this.cdr.detectChanges();
  }

  /**
   * Calculate total obtained marks dynamically based on correct answers.
   */
  get calculatedObtainMarks(): number {
    let total = 0;
    if (!this.attemptData || !this.attemptData.answers) return 0;

    this.attemptData.answers.forEach((ans: any) => {
      if (this.answers[ans.question_id] === true) {
        total += Number(ans.marks) || 0;
      }
    });
    return total;
  }

  /**
   * Submit the final grading results and remarks to the server.
   */
  submitGrading(): void {
    if (this.submitting) return;
    this.submitting = true;

    const payload = {
      obtain_marks: this.calculatedObtainMarks,
      remarks: this.adminRemarks,
      answers: this.attemptData.answers.map((a: any) => ({
        question_id: a.question_id,
        is_correct: this.answers[a.question_id] === true ? 1 : 0,
      })),
    };

    this.attemptService.gradeAttempt(this.attemptId, payload).subscribe({
      next: (res) => {
        console.log('Grading saved successfully!');
        this.router.navigate(['/admin/assessment-attempts/list']);
      },
      error: (err) => {
        console.error('Submission error:', err);
        alert('Failed to save grading: ' + (err.error?.message || 'Server error'));
        this.submitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Navigate back to the assessment attempts list.
   */
  goBack(): void {
    this.router.navigate(['/admin/assessment-attempts/list']);
  }
}
