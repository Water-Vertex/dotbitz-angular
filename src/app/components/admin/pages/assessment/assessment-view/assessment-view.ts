import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-view',
  standalone: true,
  templateUrl: './assessment-view.html',
  imports: [CommonModule],
})
export class AssessmentView implements OnInit {
  attemptId!: number;
  attemptData: any = null;
  loading: boolean = true;
  correctCount: number = 0;
  wrongCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialize component and subscribe to route parameters to get attempt ID.
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
   * Fetch assessment attempt details from the server and calculate result summaries.
   */
  fetchAttempt(): void {
    this.loading = true;
    this.attemptService.getAttemptById(this.attemptId).subscribe({
      next: (res: any) => {
        this.attemptData = res.data || res;

        if (res && res.assign_assessment) {
          this.attemptData.obtain_marks = res.assign_assessment.obtain_marks;
          this.attemptData.remarks = res.assign_assessment.remarks;
          this.attemptData.total_marks = res.assign_assessment.total_marks;
        }

        if (this.attemptData?.answers) {
          this.correctCount = this.attemptData.answers.filter((a: any) => a.is_correct == 1).length;
          this.wrongCount = this.attemptData.answers.filter(
            (a: any) => !a.is_correct || a.is_correct == 0,
          ).length;
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
   * Navigate to the assessment recheck page for manual grading updates.
   */
  goRecheck(): void {
    this.router.navigate(['admin/assessment/recheck', this.attemptId]);
  }

  /**
   * Navigate back to the main list of assessment attempts.
   */
  goBack(): void {
    this.router.navigate(['/admin/assessment-attempts/list']);
  }
}
