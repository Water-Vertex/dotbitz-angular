import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service'; 

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
    private cdr: ChangeDetectorRef,
    public auth: AuthService, 
    private toastService: ToastService,   
  ) {}

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }
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


    addExemption(attempt: any): void {
    if (!attempt.student_id || !attempt.course_id) {
      this.toastService.error('Error', 'Missing student or course information.');
      return;
    }
    this.assessmentAttemptService.addExemption({
      student_id: attempt.student_id,
      course_id: attempt.course_id
    }).subscribe({
      next: () => {
        this.toastService.success('Exemption Added', `Exemption added for ${attempt.student_name} - ${attempt.course_name}`);
        attempt.is_exempted = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Failed', err.error?.message || err.message || 'Could not add exemption');
      }
    });
  }
}
