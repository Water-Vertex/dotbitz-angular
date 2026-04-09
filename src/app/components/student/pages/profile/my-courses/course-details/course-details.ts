import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../../services/course.service';
import { AssignmentService } from '../../../../../../services/assignment.service';

@Component({
  selector: 'app-course-student',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
})
export class MyCourseDetail implements OnInit {
  course: any = null;
  courseId!: number;
  loading = true;
  activeTab: 'instructor' | 'curriculum' | 'assignment' | 'quiz' = 'instructor';

  // Assignment tab
  assignments: any[] = [];
  assignmentsLoading = false;
  assignmentsLoaded = false;

  // Quiz tab
  quizzes: any[] = [];
  quizzesLoading = false;
  quizzesLoaded = false;
  quizAttempts: { [quizId: number]: string } = {}; // quizId → status

  // Confirm modal
  showStartConfirm = false;
  pendingQuiz: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('courseId');
      if (id) {
        this.courseId = +id;
        this.loadCourse();
      }
    });
  }

  loadCourse(): void {
    this.loading = true;
    this.courseService.getStudentCourseDetail(this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab as 'instructor' | 'curriculum' | 'assignment' | 'quiz';
    if (tab === 'assignment' && !this.assignmentsLoaded) {
      this.loadAssignments();
    }
    if (tab === 'quiz' && !this.quizzesLoaded) {
      this.loadQuizzes();
    }
  }

  loadAssignments(): void {
    this.assignmentsLoading = true;
    this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
      next: (res: any) => {
        this.assignments = res.data || [];
        this.assignmentsLoaded = true;
        this.assignmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.assignmentsLoading = false; }
    });
  }

  // loadQuizzes(): void {
  //   this.quizzesLoading = true;
  //   const batchId = this.course?.batch_id;

  //   if (!batchId) {
  //     this.quizzesLoading = false;
  //     this.quizzesLoaded = true;
  //     return;
  //   }

  //   this.courseService.getQuizzesByBatch(batchId).subscribe({
  //     next: (res: any) => {
  //       this.quizzes = res.data || [];
  //       this.quizzesLoaded = true;
  //       this.quizzesLoading = false;
  //       // Har quiz ka attempt check karo
  //       this.checkAllAttempts();
  //       this.cdr.detectChanges();
  //     },
  //     error: () => { this.quizzesLoading = false; }
  //   });
  // }
  // checkAllAttempts(): void {
  //   this.quizzes.forEach(quiz => {
  //     this.courseService.checkQuizAttempt(quiz.id).subscribe({
  //       next: (res: any) => {
  //         if (res.attempted) {
  //           this.quizAttempts[quiz.id] = res.attempt.status;
  //         }
  //         this.cdr.detectChanges();
  //       },
  //       error: () => {}
  //     });
  //   });
  // }

  loadQuizzes(): void {
  this.quizzesLoading = true;
  const batchId = this.course?.batch_id;

  if (!batchId) {
    this.quizzesLoading = false;
    this.quizzesLoaded = true;
    return;
  }

  this.courseService.getQuizzesByBatch(batchId).subscribe({
    next: (res: any) => {
      this.quizzes = res.data || [];
      this.quizzesLoaded = true;
      // ✅ Pehle quizzes set karo phir attempts check karo
      this.checkAllAttempts();
    },
    error: () => {
      this.quizzesLoading = false;
    }
  });
}

checkAllAttempts(): void {
  if (this.quizzes.length === 0) {
    this.quizzesLoading = false;
    this.cdr.detectChanges();
    return;
  }

  let completed = 0;
  const total = this.quizzes.length;

  this.quizzes.forEach(quiz => {
    this.courseService.checkQuizAttempt(quiz.id).subscribe({
      next: (res: any) => {
        if (res.attempted) {
          // ✅ Spread operator — Angular naya object detect karega
          this.quizAttempts = {
            ...this.quizAttempts,
            [quiz.id]: res.attempt.status
          };
        }
        completed++;
        if (completed === total) {
          this.quizzesLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        completed++;
        if (completed === total) {
          this.quizzesLoading = false;
          this.cdr.detectChanges();
        }
      }
    });
  });
}
  getAttemptStatus(quizId: number): string | null {
    return this.quizAttempts[quizId] || null;
  }

  // Start quiz confirm modal
  onStartQuiz(quiz: any): void {
    this.pendingQuiz = quiz;
    this.showStartConfirm = true;
  }

  cancelStart(): void {
    this.showStartConfirm = false;
    this.pendingQuiz = null;
  }

  confirmStart(): void {
    this.showStartConfirm = false;
    if (this.pendingQuiz) {
      this.router.navigate(['/student/quiz', this.pendingQuiz.id]);
    }
    this.pendingQuiz = null;
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }
}
