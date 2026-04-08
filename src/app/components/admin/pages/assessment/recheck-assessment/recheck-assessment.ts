import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentAttemptService } from '../../../../../services/assessment-attempt.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recheck-assessment',
  standalone: true,
  templateUrl: './recheck-assessment.html',
  imports: [CommonModule, FormsModule],
})
export class RecheckAssessment implements OnInit {
  attemptId!: number;
  attemptData: any = null;
  loading: boolean = true;
  submitting: boolean = false;

  obtainMarks: number = 0;
  adminRemarks: string = '';
  answers: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Subscribe to route parameters and initialize the component with attempt ID.
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
   * Fetch assessment data from the server and populate the local models.
   */
  fetchAttempt(): void {
    this.loading = true;
    this.attemptService.getAttemptById(this.attemptId).subscribe({
      next: (res: any) => {
        this.attemptData = res.data || res;
        const assignData = this.attemptData.assign_assessment || this.attemptData;

        this.obtainMarks = Number(assignData.obtain_marks) || 0;
        this.adminRemarks = assignData.remarks ?? '';

        this.answers = {};
        if (this.attemptData.answers) {
          this.attemptData.answers.forEach((a: any) => {
            this.answers[a.question_id] = a.is_correct == 1;
          });
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Update correct/wrong status of a question and recalculate the total obtained marks.
   */
  updateMarks(qid: number, status: boolean): void {
    this.answers[qid] = status;

    let total = 0;
    this.attemptData.answers.forEach((ans: any) => {
      if (this.answers[ans.question_id] === true) {
        total += Number(ans.marks) || 0;
      }
    });

    this.obtainMarks = total;
    this.cdr.detectChanges();
  }

  /**
   * Send the updated grading results and remarks back to the server.
   */
  submitRecheck(): void {
    if (this.submitting) return;
    this.submitting = true;

    const payload = {
      obtain_marks: this.obtainMarks,
      remarks: this.adminRemarks,
      answers: Object.keys(this.answers).map((qid) => ({
        question_id: +qid,
        is_correct: this.answers[+qid] ? 1 : 0,
      })),
    };

    this.attemptService.gradeAttempt(this.attemptId, payload).subscribe({
      next: () => {
        this.router.navigate(['admin/assessment/graded-details', this.attemptId]);
      },
      error: () => {
        this.submitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Navigate back to the previous assessment details view.
   */
  goBack(): void {
    this.router.navigate(['admin/assessment/graded-details', this.attemptId]);
  }
}
