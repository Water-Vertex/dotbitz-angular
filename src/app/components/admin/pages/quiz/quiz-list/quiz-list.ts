import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';

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
export class QuizList implements OnInit {

  quizzes: any[] = [];
  groupedQuizzes: QuizGroup[] = [];
  courses: any[] = [];
  batches: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;

  loading = false;
  loadingCourses = false;
  loadingBatches = false;
  deleting: number | null = null;

  // Accordion state
  expandedCourses: Set<number> = new Set();

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadQuizzes();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCourses = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.batches = [];
    this.loadQuizzes();

    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.quizService.getBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingBatches = false;
        this.cdr.detectChanges();
      }
    });
  }

  onBatchChange(): void {
    this.loadQuizzes(this.selectedCourseId ?? undefined, this.selectedBatchId ?? undefined);
  }

  loadQuizzes(courseId?: number, batchId?: number): void {
    this.loading = true;
    this.quizService.getQuizzes(courseId, batchId).subscribe({
      next: (res: any) => {
        this.quizzes = res.data || [];
        this.groupQuizzesByCourse();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  groupQuizzesByCourse(): void {
    const groups = new Map<number, QuizGroup>();

    this.quizzes.forEach(quiz => {
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

    // Auto-expand first course by default if there are any
    if (this.groupedQuizzes.length > 0 && this.expandedCourses.size === 0) {
      this.expandedCourses.add(this.groupedQuizzes[0].courseId);
    }
  }

  // Toggle accordion for a specific course
  toggleCourse(index: number): void {
    const courseId = this.groupedQuizzes[index].courseId;
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
    this.cdr.detectChanges();
  }

  // Check if a course is expanded
  isExpanded(index: number): boolean {
    return this.expandedCourses.has(this.groupedQuizzes[index].courseId);
  }

  clearFilters(): void {
    this.selectedCourseId = null;
    this.selectedBatchId = null;
    this.batches = [];
    this.loadQuizzes();
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/quiz/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    this.deleting = id;
    this.quizService.deleteQuiz(id).subscribe({
      next: (res: any) => {
        this.deleting = null;
        if (res.success) {
          this.quizzes = this.quizzes.filter(q => q.id !== id);
          this.groupQuizzesByCourse();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.deleting = null;
        alert('Failed to delete quiz.');
      }
    });
  }
}
