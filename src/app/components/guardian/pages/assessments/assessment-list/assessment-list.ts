
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
  selectedCourseFilter: string = '';
  uniqueCourses: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignService: AssignAssessmentService,
    private coursesService: CoursesByStudentService,
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
        if (event.url.includes('/guardian/student-assessments') && this.selectedStudentId) {
          this.loadAssessmentsByStudent(this.selectedStudentId);
        }
      });
  }

  ngOnInit(): void {
    this.fetchStudents();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.applyFilter(term);
      });
  }

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

  onStudentSelect(studentIdValue: string): void {
    const studentId = studentIdValue ? Number(studentIdValue) : null;
    this.selectedStudentId = studentId;

    // Reset data when switching students
    this.assessments = [];
    this.filteredAssessments = [];
    this.uniqueCourses = [];  // 
    this.selectedCourseFilter = ''; 

    if (!studentId) {
      this.studentName = '';
      return;
    }

    this.loadAssessmentsByStudent(studentId);
  }

  
  onCourseFilterChange(courseName: string): void {
    this.selectedCourseFilter = courseName;
    this.applyFilter(this.searchTerm);
  }

  
  extractUniqueCourses(): void {
    const courses = this.assessments.map(item => item.assessment_query?.course?.course_name).filter(Boolean);
    this.uniqueCourses = [...new Set(courses)] as string[];
  }

  loadAssessmentsByStudent(studentId: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignService
      .getGuardianStudentAssessments(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.assessments = response?.assessments || [];
          this.studentName = response?.student_name || 'Student';
          
          
          this.extractUniqueCourses();
          
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
    let filtered = [...this.assessments];

    if (term) {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.assessment_query?.course?.course_name?.toLowerCase().includes(lowerTerm) ||
          item.assessment?.assessment_title?.toLowerCase().includes(lowerTerm),
      );
    }

   
    if (this.selectedCourseFilter) {
      filtered = filtered.filter(
        (item) => item.assessment_query?.course?.course_name === this.selectedCourseFilter
      );
    }

    this.filteredAssessments = filtered;
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