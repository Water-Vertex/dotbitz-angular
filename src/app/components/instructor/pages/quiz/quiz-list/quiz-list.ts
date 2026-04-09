import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { McqService } from '../../../../../services/mcq.service';

@Component({
  selector: 'app-instructor-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-list.html',
})
export class InstructorQuizList implements OnInit {

  quizzes: any[] = [];
  courses: any[] = [];
  selectedCourseId: number | null = null;
  loading = false;
  deleting: number | null = null;

  constructor(
    private quizService: QuizService,
    private mcqService: McqService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadQuizzes();
  }

  loadCourses(): void {
    this.mcqService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadQuizzes(): void {
    this.loading = true;
    this.quizService.getInstructorQuizzes().subscribe({
      next: (res: any) => {
        this.quizzes = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onCourseFilter(): void {
    this.loading = true;
    if (!this.selectedCourseId) {
      this.loadQuizzes();
      return;
    }
    this.quizService.getInstructorQuizzes().subscribe({
      next: (res: any) => {
        const all = res.data || [];
        this.quizzes = all.filter((q: any) => q.course_id == this.selectedCourseId);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  onEdit(id: number): void {
    this.router.navigate(['/instructor/quiz/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    this.deleting = id;
    this.quizService.deleteInstructorQuiz(id).subscribe({
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