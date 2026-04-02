import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignAssessmentService } from '../../../../../services/assign-assessment.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-assessment-list.html',
  styleUrls: ['./assign-assessment-list.css'],
})
export class StudentAssessmentList implements OnInit, OnDestroy {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  studentEmail: string | null = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignService: AssignAssessmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    // Watch for route returns to refresh the list automatically
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
    this.studentEmail = localStorage.getItem('student_email'); // Optional: For header display
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

    // Calling the Student-Specific Service Method
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

      // Filtered for student context: Search by Course or Assessment Title
      this.filteredAssessments = this.assessments.filter(
        (item) =>
          item.appointment?.course?.course_name?.toLowerCase().includes(lowerTerm) ||
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

  /**
   * For Student: Navigate to start the test or view results
   * Adjusted routes to match student side prefix
   */
  openAssessment(item: any): void {
    if (item.status === 'Completed' || item.status === 'marked') {
      // Redirect to results view
      this.router.navigate(['/student/my-assessments/result', item.id]);
    } else {
      // Redirect to the actual test taking page
      this.router.navigate(['/student/my-assessments/start', item.id]);
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
