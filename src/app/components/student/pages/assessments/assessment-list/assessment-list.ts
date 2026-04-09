import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
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
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
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
      .subscribe((term) => {
        this.applyFilter(term);
      });
  }

  loadMyAssessments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignService
      .getStudentAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.assessments = response?.data || [];
          this.applyFilter(this.searchTerm);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.error('Error', 'Failed to load your assessments.');
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

  openAssessment(item: any): void {
    const attemptStatus = item.attempt?.status;
    if (attemptStatus === 'completed' || attemptStatus === 'time_up') {
      this.router.navigate(['/student/my-assessments/result', item.id]);
    } else {
      this.router.navigate(['/student/assessment/attempt', item.id]);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
