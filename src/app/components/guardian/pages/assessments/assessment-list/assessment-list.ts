import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignAssessmentService } from '../../../../../services/assignedassessment.service';
import { CoursesByStudentService } from '../../../../../services/coursesbystudent.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-list.html',
  styleUrls: ['./assessment-list.css'],
})
export class GuardianAssessmentList implements OnInit, OnDestroy {
  // --- Student Selection Properties ---
  students: any[] = [];
  selectedStudentId: number | null = null;
  loadingStudents: boolean = false;

  // --- Assessment Data Properties ---
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  studentName: string = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignService: AssignAssessmentService,
    private coursesService: CoursesByStudentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    // Watch for route navigation to refresh if needed
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: any) => {
        if (event.url.includes('/guardian/student-assessments') && this.selectedStudentId) {
          this.loadAssessmentsByStudent(this.selectedStudentId);
        }
      });
  }

  ngOnInit(): void {
    // 1. Initially load the list of children for the dropdown
    this.fetchStudents();

    // 2. Setup search debounce
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.applyFilter(term);
      });
  }

  // Fetch initial student list
  fetchStudents(): void {
    this.loadingStudents = true;
    this.coursesService
      .getGuardianStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.students = res.students || res.data?.students || [];
          this.loadingStudents = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.loadingStudents = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Triggered when guardian selects a child from the dropdown
  onStudentSelect(studentIdValue: string): void {
    const studentId = studentIdValue ? Number(studentIdValue) : null;
    this.selectedStudentId = studentId;

    // Reset data when switching students
    this.assessments = [];
    this.filteredAssessments = [];

    if (!studentId) {
      this.studentName = '';
      return;
    }

    this.loadAssessmentsByStudent(studentId);
  }

  // Load assessments for specific student ID
  loadAssessmentsByStudent(studentId: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignService
      .getGuardianStudentAssessments(studentId) // Ensure service is updated to accept this ID
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.assessments = response?.assessments || [];
          this.studentName = response?.student_name || 'Student';
          this.applyFilter(this.searchTerm);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('API Error:', error);
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
          item.appointment?.course?.course_name?.toLowerCase().includes(lowerTerm) ||
          item.assessment?.assessment_title?.toLowerCase().includes(lowerTerm),
      );
    }
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  refreshData(): void {
    if (this.selectedStudentId) {
      this.loadAssessmentsByStudent(this.selectedStudentId);
    } else {
      this.fetchStudents();
    }
  }

  viewAssessmentDetails(item: any): void {
    if (item.status === 'Completed' || item.status === 'marked') {
      this.router.navigate(['/guardian/student-assessments/result', item.id]);
    } else {
      this.toastService.info('Pending', 'This assessment is not yet completed by the student.');
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