import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignAssessmentService } from '../../../../../services/assignedassessment.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-list.html',
  styleUrls: ['./assessment-list.css'],
})
export class StudentAssessmentList implements OnInit, OnDestroy {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  studentEmail: string | null = '';
  showStartConfirm = false;
  selectedAssessmentItem: any = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignService: AssignAssessmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe((event: any) => {
        if (event.url.includes('/student/my-assessments')) {
          this.loadMyAssessments();
        }
      });
  }

  ngOnInit(): void {
    this.studentEmail = localStorage.getItem('student_email');
    this.loadMyAssessments();
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.applyFilter(term));
  }

  loadMyAssessments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignService.getStudentAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.assessments = response?.data || [];
          this.applyFilter(this.searchTerm);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to load assessments.');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  applyFilter(term: string): void {
    if (!term) {
      this.filteredAssessments = [...this.assessments];
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredAssessments = this.assessments.filter(
        (item) =>
          item.assessment_query?.course?.course_name?.toLowerCase().includes(lowerTerm) ||
          item.assessment?.assessment_title?.toLowerCase().includes(lowerTerm),
      );
    }
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  refreshData(): void {
    this.loadMyAssessments();
  }

  onStartTest(item: any): void {
    if (this.isOverdue(item.due_date)) {
      this.toastService.error('Error', 'This assessment is overdue!');
      return;
    }
    this.selectedAssessmentItem = item;
    this.showStartConfirm = true;
  }

  cancelStart(): void {
    this.showStartConfirm = false;
    this.selectedAssessmentItem = null;
  }

  confirmStart(): void {
    this.showStartConfirm = false;
    this.router.navigate(['/student/assessment/attempt', this.selectedAssessmentItem.id]);
    this.selectedAssessmentItem = null;
  }

  onResumeTest(item: any): void {
    this.router.navigate(['/student/assessment/attempt', item.id]);
  }

  onViewAttempt(item: any): void {
    if (!this.canViewAttempt(item)) {
      return;
    }
    this.router.navigate(['/student/assessment/view', item.id]);
  }

  // Stats Helper Methods
  getCompletedCount(): number {
    return this.filteredAssessments.filter(item =>
      item.attempt?.status === 'completed'
    ).length;
  }

  getPendingCount(): number {
    return this.filteredAssessments.filter(item =>
      !item.attempt || item.attempt?.status === 'pending'
    ).length;
  }

  getAverageScore(): number {
    const completed = this.filteredAssessments.filter(item =>
      item.obtain_marks !== null && item.obtain_marks !== undefined && item.total_marks
    );
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, item) => sum + (item.obtain_marks / item.total_marks) * 100, 0);
    return Math.round(total / completed.length);
  }

  // Status Helper Methods
  getStatusBadgeClass(item: any): string {
    if (!item.attempt) {
      if (item.due_date && this.isOverdue(item.due_date)) {
        return 'bg-red-100 text-red-700';
      }
      return 'bg-gray-100 text-gray-600';
    }
    switch(item.attempt?.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'time_up': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusDotClass(item: any): string {
    if (!item.attempt) {
      if (item.due_date && this.isOverdue(item.due_date)) {
        return 'bg-red-500';
      }
      return 'bg-gray-400';
    }
    switch(item.attempt?.status) {
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'time_up': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }

  getStatusText(item: any): string {
    if (!item.attempt) {
      if (item.due_date && this.isOverdue(item.due_date)) {
        return 'Overdue';
      }
      return 'Not Started';
    }
    switch(item.attempt?.status) {
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'time_up': return 'Time Up';
      default: return 'Not Started';
    }
  }

  canViewAttempt(item: any): boolean {
    const hasAttempt = item.attempt?.status === 'completed' ||
                       item.attempt?.status === 'time_up';
    return hasAttempt;
  }

  isDueSoon(dueDate: string): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 3 && diffDays >= 0;
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    const nowUTCString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return dueDate < nowUTCString;
  }

  formatDateOnly(dbDate: string): string {
    if (!dbDate) return '---';

    try {
      const dateOnly = dbDate.split(' ')[0];
      const [year, month, day] = dateOnly.split('-');

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[parseInt(month) - 1];

      return `${parseInt(day)} ${monthName} ${year}`;
    } catch(e) {
      console.error('formatDateOnly error:', e);
      return dbDate;
    }
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
