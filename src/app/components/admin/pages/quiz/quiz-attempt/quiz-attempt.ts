import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-attempt.html',
})
export class AdminQuizAttempts implements OnInit {

  attempts: any[] = [];
  courses: any[] = [];
  quizzes: any[] = [];
  selectedCourseId: number | null = null;
  selectedQuizId: number | null = null;
  loading = false;

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadAttempts();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  onCourseFilter(): void {
    this.selectedQuizId = null;
    this.quizzes = [];

    if (this.selectedCourseId) {
      this.quizService.getQuizzes(this.selectedCourseId).subscribe({
        next: (res: any) => {
          this.quizzes = res.data || [];
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }

    this.loadAttempts();
  }

  onQuizFilter(): void {
    this.loadAttempts();
  }

  loadAttempts(): void {
    this.loading = true;
    this.quizService.getAttemptedList(
      this.selectedCourseId ?? undefined,
      this.selectedQuizId ?? undefined
    ).subscribe({
      next: (res: any) => {
        this.attempts = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  onCheck(attemptId: number): void {
    this.router.navigate(['/admin/quiz/check', attemptId]);
  }
  onView(attemptId: number): void {
  this.router.navigate(['/admin/quiz/view', attemptId]);
}
}
