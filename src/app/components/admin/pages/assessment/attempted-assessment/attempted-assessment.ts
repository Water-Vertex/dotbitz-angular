import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssessmentAttemptService } from '../../../../../services/assessment-attempt.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attempted-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attempted-assessment.html',
  styleUrl: './attempted-assessment.css',
})
export class AttemptedAssessment implements OnInit {
  attempts: any[] = [];
  loading = false;

  constructor(
    private assessmentAttemptService: AssessmentAttemptService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAttempts();
  }

  loadAttempts(): void {
    this.loading = true;
    this.assessmentAttemptService.getAllAttempts().subscribe({
      next: (res: any) => {
        this.attempts = res.data || res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

 
  onCheck(attemptId: number) {
    this.router.navigate(['/admin/assessment/check', attemptId]);
  }

  
onView(attemptId: number) {
 
  this.router.navigate(['/admin/assessment/graded-details', attemptId]);
}
}
