import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-attempt.html',
})
export class AdminQuizAttempts implements OnInit {

  // Dropdown data
  courses: any[] = [];
  batches: any[] = [];

  // Selected
  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;

  // Loading
  loadingCourses = false;
  loadingBatches = false;
  loadingStudents = false;

  // Students + Quizzes data
  students: any[] = [];
  quizzes: any[] = [];

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCourses = false; }
    });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.batches = [];
    this.students = [];
    this.quizzes = [];
    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.quizService.getBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });
  }

  onBatchChange(): void {
    this.students = [];
    this.quizzes = [];
    if (!this.selectedCourseId || !this.selectedBatchId) return;
    this.loadStudentStatus();
  }

  loadStudentStatus(): void {
    this.loadingStudents = true;
    this.quizService.getQuizBatchStatus({
      course_id: this.selectedCourseId,
      batch_id:  this.selectedBatchId,
    }).subscribe({
      next: (res: any) => {
        this.students        = res.data?.students || [];
        this.quizzes         = res.data?.quizzes  || [];
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingStudents = false; }
    });
  }

  getQuizData(student: any, quizId: number): any {
    return student.quizzes?.find((q: any) => q.quiz_id === quizId) || null;
  }

  getStatus(student: any, quizId: number): string {
    return this.getQuizData(student, quizId)?.status || 'not_attempted';
  }

  onCheck(attemptId: number): void {
    this.router.navigate(['/admin/quiz/check', attemptId]);
  }

  onView(attemptId: number): void {
    this.router.navigate(['/admin/quiz/view', attemptId]);
  }
  // Add these methods to calculate statistics

getCompletionRate(): number {
  if (this.students.length === 0 || this.quizzes.length === 0) return 0;

  let totalAttempts = 0;
  let completedAttempts = 0;

  this.students.forEach(student => {
    this.quizzes.forEach(quiz => {
      totalAttempts++;
      const status = this.getStatus(student, quiz.id);
      if (status === 'submitted' || status === 'overdue_submitted' || status === 'time_up') {
        completedAttempts++;
      }
    });
  });

  return totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0;
}

getAverageScore(): number {
  let totalScore = 0;
  let scoredAttempts = 0;

  this.students.forEach(student => {
    this.quizzes.forEach(quiz => {
      const quizData = this.getQuizData(student, quiz.id);
      if (quizData?.attempt?.obtained_marks !== null && quizData?.attempt?.obtained_marks !== undefined) {
        totalScore += (quizData.attempt.obtained_marks / quiz.marks) * 100;
        scoredAttempts++;
      }
    });
  });

  return scoredAttempts > 0 ? Math.round(totalScore / scoredAttempts) : 0;
}
}
