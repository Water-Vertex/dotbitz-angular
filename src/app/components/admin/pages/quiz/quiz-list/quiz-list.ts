import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.css']
})
export class QuizList implements OnInit {

  quizzes: any[] = [];
  courses: any[] = [];
  selectedCourseId: number | null = null;
  loading = false;
  deleting: number | null = null;

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
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadQuizzes(courseId?: number): void {
    this.loading = true;
    this.quizService.getQuizzes(courseId).subscribe({
      next: (res: any) => {
        this.quizzes = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCourseFilter(): void {
    this.loadQuizzes(this.selectedCourseId ?? undefined);
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