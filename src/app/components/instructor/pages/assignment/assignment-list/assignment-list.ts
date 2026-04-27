import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-instructor-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assignment-list.html',
  styleUrls: ['./assignment-list.css'],
})
export class InstructorAssignmentList implements OnInit, OnDestroy {
  // Original properties
  assignments: Assignment[] = [];
  allAssignments: Assignment[] = [];
  courses: any[] = [];
  batches: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;

  loading = false;
  loadingBatches = false;
  deleting: number | null = null;

  // Properties for accordion & search
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
    private cdr: ChangeDetectorRef
  ) {
    // Navigation event handling - reload when navigating to this route
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e: any) => {
        if (e.url.includes('/instructor/assignment')) {
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
    this.assignmentService.getInstructorCourses().subscribe({
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
    this.assignmentService.getInstructorBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingBatches = false;
        this.toastService.error('Error', 'Failed to load batches');
      }
    });
  }

  onBatchChange(): void {
    this.applyFilters();
  }

  loadAssignments(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.assignmentService.getInstructorAssignments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.allAssignments = res.data || [];
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to load assignments');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Main filter method - combines course, batch, and search filters
  applyFilters(): void {
    let result = [...this.allAssignments];

    // Apply course filter
    if (this.selectedCourseId) {
      result = result.filter(assignment => assignment.course_id == this.selectedCourseId);
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

  onCourseFilter(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  // Clear all filters - now includes batch filter
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

  onEdit(id: number): void {
    this.router.navigate(['/instructor/assignment/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    this.deleting = id;
    this.cdr.detectChanges();

    // Optimistic UI update - remove from local array immediately
    this.allAssignments = this.allAssignments.filter((a: any) => a.id !== id);
    this.applyFilters();

    this.assignmentService.deleteInstructorAssignment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res?.message || 'Assignment deleted successfully');
          this.deleting = null;
          // No need to reload all assignments, already updated
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to delete assignment');
          this.deleting = null;
          // Reload on error to restore correct data
          this.loadAssignments();
        }
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
