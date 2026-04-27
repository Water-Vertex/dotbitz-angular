import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignmentService } from '../../../../../services/assignment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Assignment } from '../../../../../models/assignment.model';

interface AssignmentGroup {
  courseId: number;
  courseName: string;
  assignments: Assignment[];
}

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './assignment-list.html',
  styleUrls: ['./assignment-list.css'],
})
export class AssignmentList implements OnInit, OnDestroy {
  // Original properties
  assignments: Assignment[] = [];
  allAssignments: Assignment[] = [];
  courses: any[] = [];
  batches: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;

  isLoading = false;
  loadingBatches = false;
  deleting: number | null = null;

  // New properties for accordion & search
  filteredAssignments: Assignment[] = [];
  groupedAssignments: AssignmentGroup[] = [];
  searchTerm: string = '';

  // Accordion state
  expandedCourses: Set<number> = new Set();

  // Search debounce subject
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e: any) => {
        if (e.url.includes('/admin/assignment')) {
          this.loadAssignments();
          this.loadCourses();
        }
      });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadAssignments();

    // Setup search debounce
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  loadCourses(): void {
    this.assignmentService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.batches = [];
    this.applyFilters();

    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.assignmentService.getBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });
  }

  onBatchChange(): void {
    this.applyFilters();
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignmentService.getAssignments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allAssignments = Array.isArray(res.data) ? res.data : [];
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to load assignments');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Main filter method - combines course, batch, and search filters
  applyFilters(): void {
    let result = [...this.allAssignments];

    // Apply course filter
    if (this.selectedCourseId) {
      result = result.filter(a => a.course_id == this.selectedCourseId);
    }

    // Apply batch filter
    if (this.selectedBatchId) {
      result = result.filter((a: any) => a.batch_id == this.selectedBatchId);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(assignment =>
        assignment.title?.toLowerCase().includes(term)
      );
    }

    this.assignments = result;
    this.filteredAssignments = result;
    this.groupAssignmentsByCourse();
    this.cdr.detectChanges();
  }

  // Group assignments by course for accordion display
  groupAssignmentsByCourse(): void {
    const groups = new Map<number, AssignmentGroup>();

    this.filteredAssignments.forEach(assignment => {
      const courseId = assignment.course_id;
      const courseName = assignment.course?.course_name || `Course #${courseId}`;

      if (!groups.has(courseId)) {
        groups.set(courseId, {
          courseId: courseId,
          courseName: courseName,
          assignments: []
        });
      }
      groups.get(courseId)!.assignments.push(assignment);
    });

    // Convert to array and sort by course name
    this.groupedAssignments = Array.from(groups.values()).sort((a, b) =>
      a.courseName.localeCompare(b.courseName)
    );

    // Auto-expand first course by default if there are any and no course is expanded
    if (this.groupedAssignments.length > 0 && this.expandedCourses.size === 0) {
      this.expandedCourses.add(this.groupedAssignments[0].courseId);
    }
  }

  // Accordion methods
  toggleCourse(index: number): void {
    const courseId = this.groupedAssignments[index].courseId;
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
    this.cdr.detectChanges();
  }

  isExpanded(index: number): boolean {
    return this.expandedCourses.has(this.groupedAssignments[index].courseId);
  }

  // Search method
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCourseId = null;
    this.selectedBatchId = null;
    this.batches = [];
    this.applyFilters();
  }

  refreshData(): void {
    this.loadAssignments();
    this.loadCourses();
  }

  editAssignment(id: number): void {
    this.router.navigate(['/admin/assignment/edit', id]);
  }

  deleteAssignment(id: number): void {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    this.deleting = id;
    this.assignmentService.deleteAssignment(id).subscribe({
      next: (res) => {
        this.toastService.success('Success', res?.message || 'Assignment deleted');
        this.allAssignments = this.allAssignments.filter((a: any) => a.id !== id);
        this.applyFilters();
        this.deleting = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to delete assignment');
        this.deleting = null;
        this.loadAssignments();
      },
    });
  }

  trackById(index: number, assignment: Assignment): number {
    return assignment.id!;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
