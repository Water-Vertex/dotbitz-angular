import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';

interface QuizGroup {
  courseId: number;
  courseName: string;
  quizzes: any[];
}

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.css']
})
export class InstructorQuizList implements OnInit, OnDestroy {
  quizzes: any[] = [];
  filteredQuizzes: any[] = [];
  groupedQuizzes: QuizGroup[] = [];
  courses: any[] = [];
  batches: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;
  searchTerm: string = '';

  loading = false;
  loadingCourses = false;
  loadingBatches = false;
  deleting: number | null = null;

  // Search debounce subject
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Accordion state
  expandedCourses: Set<number> = new Set();

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
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
        if (e.url.includes('/instructor/quiz')) {
          this.loadQuizzes();
          this.loadCourses();
        }
      });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadQuizzes();

    // Setup search debounce
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to load courses');
        this.loadingCourses = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.batches = [];
    this.applyFilters();

    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.quizService.getInstructorBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to load batches');
        this.loadingBatches = false;
        this.cdr.detectChanges();
      }
    });
  }

  onBatchChange(): void {
    this.applyFilters();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.quizService.getInstructorQuizzes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.quizzes = res.data || [];
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to load quizzes');
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Main filter method - combines course, batch, and search filters
  applyFilters(): void {
    let result = [...this.quizzes];

    // Apply course filter
    if (this.selectedCourseId) {
      result = result.filter(quiz => quiz.course_id == this.selectedCourseId);
    }

    // Apply batch filter
    if (this.selectedBatchId) {
      result = result.filter(quiz => quiz.batch_id == this.selectedBatchId);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(quiz =>
        quiz.name?.toLowerCase().includes(term) ||
        quiz.title?.toLowerCase().includes(term)
      );
    }

    this.filteredQuizzes = result;
    this.groupQuizzesByCourse();
    this.cdr.detectChanges();
  }

  groupQuizzesByCourse(): void {
    const groups = new Map<number, QuizGroup>();

    this.filteredQuizzes.forEach(quiz => {
      const courseId = quiz.course_id;
      const courseName = quiz.course?.course_name || `Course #${courseId}`;

      if (!groups.has(courseId)) {
        groups.set(courseId, {
          courseId: courseId,
          courseName: courseName,
          quizzes: []
        });
      }
      groups.get(courseId)!.quizzes.push(quiz);
    });

    // Convert to array and sort by course name
    this.groupedQuizzes = Array.from(groups.values()).sort((a, b) =>
      a.courseName.localeCompare(b.courseName)
    );

    // Auto-expand first course by default if there are any and no course is expanded
    if (this.groupedQuizzes.length > 0 && this.expandedCourses.size === 0) {
      this.expandedCourses.add(this.groupedQuizzes[0].courseId);
    }
  }

  // Accordion methods
  toggleCourse(index: number): void {
    const courseId = this.groupedQuizzes[index].courseId;
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
    this.cdr.detectChanges();
  }

  isExpanded(index: number): boolean {
    return this.expandedCourses.has(this.groupedQuizzes[index].courseId);
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
    this.loadQuizzes();
    this.loadCourses();
  }

  onEdit(id: number): void {
    this.router.navigate(['/instructor/quiz/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    this.deleting = id;
    this.cdr.detectChanges();

    // Optimistic UI update - remove from local array immediately
    this.quizzes = this.quizzes.filter(q => q.id !== id);
    this.applyFilters();

    this.quizService.deleteQuiz(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res?.message || 'Quiz deleted successfully');
          this.deleting = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to delete quiz');
          this.deleting = null;
          // Reload on error to restore correct data
          this.loadQuizzes();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
