import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

@Component({
  selector: 'app-attempted-assessment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assessment-attempt.html',
})
export class AttemptedAssessment implements OnInit {
  attempts: any[] = [];
  loading = false;

  constructor(
    private assessmentAttemptService: AssessmentAttemptService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAttempts();
  }

  loadAttempts(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.assessmentAttemptService.getAllAttempts().subscribe({
      next: (res: any) => {
        this.attempts = res?.data || res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading attempts:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMarkedCount(): number {
    return this.attempts.filter(a => a.assign_status === 'marked').length;
  }

  getPendingCount(): number {
    return this.attempts.filter(a => a.assign_status !== 'marked').length;
  }

  getUniqueStudentsCount(): number {
    const uniqueStudents = new Set(this.attempts.map(a => a.student_name));
    return uniqueStudents.size;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  onCheck(attemptId: number): void {
    this.router.navigate(['/admin/assessment/check', attemptId]);
  }

  onView(attemptId: number): void {
    this.router.navigate(['/admin/assessment/view', attemptId]);
  }
}
