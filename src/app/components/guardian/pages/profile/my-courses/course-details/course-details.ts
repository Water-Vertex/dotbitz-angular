import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../../services/course.service';
import { AssignmentService } from '../../../../../../services/assignment.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
  styleUrls: ['./course-details.css']
})
export class GuardianCourseDetails implements OnInit {
  course: any = null;
  courseId!: number;
  batchId!:number;
  id!: string;
  loading = false;

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

  // Curriculum toggle
  expandedIndices: number[] = [];

  // For viewing assignment submissions (guardian view-only)
  showSubmissionModal = false;
  selectedAssignment: any = null;
  selectedSubmission: any = null;
  viewingSubmission = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.activeTab = 'curriculum';

    this.route.paramMap.subscribe((params) => {
      const newId = params.get('id');
      if (newId) {
        this.id = newId;
        this.getCourseDetail();

        const currentTab = this.route.snapshot.queryParams['tab'];
        if (currentTab === 'assignment') {
          this.activeTab = 'assignment';
        } else if (currentTab === 'quiz') {
          this.activeTab = 'quiz';
        }
      }
    });

    this.route.queryParams.subscribe((params) => {
      const newTab = params['tab'];
      if (newTab && (newTab === 'assignment' || newTab === 'quiz' || newTab === 'instructor' || newTab === 'curriculum')) {
        this.activeTab = newTab;
        if (this.activeTab === 'assignment' && this.id && !this.assignmentsLoaded) {
          this.loadAssignments();
        }
        if (this.activeTab === 'quiz' && this.id && !this.quizzesLoaded) {
          this.loadQuizzes();
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadCourse(): void {
    this.loading = true;
    this.courseService.getStudentCourseDetail(this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.batchId = res.data?.batch_id;
        console.error('Course detail:', res.data);
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

  getCourseDetail() {
    this.loading = true;
    this.assignmentsLoaded = false;
    this.assignments = [];
    this.quizzesLoaded = false;
    this.quizzes = [];

    this.courseService.getGuardianCourseDetail(+this.id).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.loading = false;

        // Load data based on active tab
        if (this.activeTab === 'assignment') {
          this.loadAssignments();
        }
        if (this.activeTab === 'quiz') {
          this.loadQuizzes();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setTab(tab: 'instructor' | 'curriculum' | 'assignment' | 'quiz') {
    this.activeTab = tab;
    localStorage.setItem('guardianTab', tab);

    if (tab === 'assignment' && !this.assignmentsLoaded) {
      this.loadAssignments();
    }
    if (tab === 'quiz' && !this.quizzesLoaded) {
      this.loadQuizzes();
    }
  }

  toggleCurriculum(index: number) {
    const position = this.expandedIndices.indexOf(index);
    if (position === -1) {
      this.expandedIndices.push(index);
    } else {
      this.expandedIndices.splice(position, 1);
    }
  }

  // ==================== ASSIGNMENTS ====================
  loadAssignments() {
    this.assignmentsLoading = true;
    this.assignmentService.getAssignments(+this.id).subscribe({
      next: (res: any) => {
        console.log('Assignments API response:', res);
        this.assignments = res.data || [];
        this.assignmentsLoaded = true;
        this.assignmentsLoading = false;

        // Check attempts for each assignment
        if (this.assignments.length > 0) {
          this.checkAllAssignmentAttempts();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Assignments error:', err);
        this.assignmentsLoading = false;
        this.assignmentsLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  checkAllAssignmentAttempts(): void {
    this.assignments.forEach(assignment => {
      this.assignmentService.checkAssignmentAttempt(assignment.id).subscribe({
        next: (res: any) => {
          // Store attempts in a separate object for guardian view
          assignment.attempt = res.attempt || null;
          assignment.attempted = res.attempted || false;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    });
  }

  getAssignmentAttempt(assignmentId: number): any {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    return assignment?.attempt || null;
  }

  // View submission details (guardian view-only)
  viewSubmission(assignment: any): void {
    this.selectedAssignment = assignment;
    this.selectedSubmission = assignment.attempt || null;
    this.showSubmissionModal = true;
  }

  closeSubmissionModal(): void {
    this.showSubmissionModal = false;
    this.selectedAssignment = null;
    this.selectedSubmission = null;
    this.viewingSubmission = false;
  }

  // Helper function to get file URL
  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    const baseUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://dotbitz.com/public';
    return `${baseUrl}/${filePath}`;
  }

  // ==================== QUIZZES ====================
  loadQuizzes(): void {
    this.quizzesLoading = true;
    const batchId = this.course?.batches[0]?.id;

    if (!batchId) {
      console.error('❌ batch_id not found in course:', this.course);
      this.quizzesLoading = false;
      this.quizzesLoaded = true;
      return;
    }

    console.log('📡 Fetching quizzes for batch_id:', batchId);

    this.courseService.getQuizzesByBatch(batchId).subscribe({
      next: (res: any) => {
        this.quizzes = res.data || [];
        this.quizzesLoaded = true;
        this.checkAllQuizAttempts();
      },
      error: (err) => {
        console.error('❌ Quiz API error:', err);
        this.quizzesLoading = false;
        this.quizzesLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  checkAllQuizAttempts(): void {
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

  // View quiz attempt (guardian view-only)
  viewQuizAttempt(quiz: any): void {
    // Navigate to quiz attempt view for guardian (read-only)
    this.router.navigate(['/guardian/quiz-attempt', quiz.id, this.id]);
  }

  // ==================== HELPER FUNCTIONS ====================

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    if (!dueDate.includes('T') && !dueDate.includes(' ')) {
      due.setHours(23, 59, 59, 999);
    }
    return due < new Date();
  }

  isMoreThanWeekOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const oneWeek = new Date(due.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date() > oneWeek;
  }

  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'completed':
        return 'badge-success';
      case 'in-progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-secondary';
      default:
        return 'badge-info';
    }
  }

  getBaseUrl(): string {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://dotbitz.com/public';
}
}
