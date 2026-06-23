import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../../services/course.service';
import { AssignmentService } from '../../../../../../services/assignment.service';
import { ReviewService } from '../../../../../../services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-student',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './course-details.html',
})
export class MyCourseDetail implements OnInit {
  course: any = null;
  courseId!: number;
  batchId!:number;
  loading = true;
   activeTab: 'curriculum' | 'assignment' | 'quiz' | 'review' = 'curriculum';

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

  assignmentAttempts: { [assignmentId: number]: any } = {};
  showSubmitModal = false;
  pendingAssignmentId: number | null = null;
  selectedSubmitFile: File | null = null;
  submittingAssignment = false;
  submitFileError: string = '';
  expandedIndices: number[] = [];

  reviews: any[]    = [];
reviewsLoading    = false;
myReview: any     = null;
showReviewForm    = false;
reviewRating      = 0;
reviewText        = '';
submittingReview  = false;
reviewSubmitted   = false;
hoverRating       = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private cdr: ChangeDetectorRef,
    private reviewService: ReviewService,
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
        this.batchId = res.data?.batch_id;
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
   this.activeTab = tab as  'curriculum' | 'assignment' | 'quiz'|'review';
    if (tab === 'assignment' && !this.assignmentsLoaded) {
          console.log('Current course ID:', this.courseId);
    console.log('Current course object:', this.course);
    if (!this.assignmentsLoaded) {
      this.loadAssignments();
    }
    }
    if (tab === 'quiz' && !this.quizzesLoaded) {
      this.loadQuizzes();
    }
    if (tab === 'review') { this.loadReviews(); }
  }

  loadReviews(): void {
  this.reviewsLoading = true;
  this.reviewService.getStudentReviews().subscribe({
    next: (res: any) => {
      const allReviews = res.data || [];
      // Is course ki review find karo
      this.myReview = allReviews.find((r: any) => r.course_id == this.courseId) || null;
      this.reviewsLoading = false;
      this.cdr.detectChanges();
    },
    error: () => { this.reviewsLoading = false; }
  });
}

setRating(rating: number): void { this.reviewRating = rating; }
setHover(rating: number): void  { this.hoverRating  = rating; }
clearHover(): void               { this.hoverRating  = 0; }

submitReview(): void {
  if (!this.reviewRating) { alert('Please select a rating.'); return; }
  if (!this.reviewText.trim()) { alert('Please write a review.'); return; }

  this.submittingReview = true;
  this.reviewService.submitStudentReview({
    course_id: this.courseId,
    rating:    this.reviewRating,
    review:    this.reviewText.trim(),
  }).subscribe({
    next: (res: any) => {
      this.submittingReview = false;
      this.myReview         = res.data;
      this.showReviewForm   = false;
      this.reviewSubmitted  = true;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      this.submittingReview = false;
      alert(err.error?.message || 'Failed to submit review.');
    }
  });
}

deleteReview(): void {
  if (!confirm('Delete your review?')) return;
  this.reviewService.deleteStudentReview(this.myReview.id).subscribe({
    next: () => {
      this.myReview        = null;
      this.reviewSubmitted = false;
      this.reviewRating    = 0;
      this.reviewText      = '';
      this.cdr.detectChanges();
    },
    error: () => { alert('Failed to delete review.'); }
  });
}
// loadAssignments(): void {
//   this.assignmentsLoading = true;
//   this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
//     next: (res: any) => {
//       this.assignments = res.data || [];
//       this.assignmentsLoaded = true;
//       this.assignmentsLoading = false;
//       this.checkAllAssignmentAttempts();
//       this.cdr.detectChanges();
//     },
//     error: () => { this.assignmentsLoading = false; }
//   });
// }

toggleCurriculum(index: number) {
    const position = this.expandedIndices.indexOf(index);
    if (position === -1) {
      this.expandedIndices.push(index);
    } else {
      this.expandedIndices.splice(position, 1);
    }
  }
loadAssignments(): void {
  this.assignmentsLoading = true;

  console.log('Fetching assignments for batch_id:', this.batchId);

  this.assignmentService.getAssignmentsByBatch(this.batchId).subscribe({
    next: (res: any) => {
      console.log('Assignments API response:', res);
      this.assignments = res.data || [];
      this.assignmentsLoaded = true;
      this.assignmentsLoading = false;
      this.cdr.detectChanges();

      if (this.assignments.length > 0) {
        this.checkAllAssignmentAttempts();
      }
    },
    error: (err) => {
      console.error('Error loading assignments:', err);
      this.assignmentsLoading = false;
      this.assignmentsLoaded = true;
      this.cdr.detectChanges();
    }
  });
}
checkAllAssignmentAttempts(): void {
  this.assignments.forEach(assignment => {
    this.assignmentService.checkAssignmentAttempt(assignment.id).subscribe({
      next: (res: any) => {
        if (res.attempted) {
          this.assignmentAttempts = {
            ...this.assignmentAttempts,
            [assignment.id]: res.attempt
          };
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  });
}

getAssignmentAttempt(assignmentId: number): any {
  return this.assignmentAttempts[assignmentId] || null;
}
getBaseUrl(): string {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://dotbitz.com/public';
}
// Submit modal
onSubmitAssignment(assignmentId: number): void {
  this.pendingAssignmentId = assignmentId;
  this.selectedSubmitFile = null;
  this.submitFileError = '';
  this.showSubmitModal = true;
}

onSubmitFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedSubmitFile = input.files[0];
    this.submitFileError = '';
  }
}
isMoreThanWeekOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  const due     = new Date(dueDate);
  const oneWeek = new Date(due.getTime() + 7 * 24 * 60 * 60 * 1000);
  return new Date() > oneWeek;
}

cancelSubmitModal(): void {
  this.showSubmitModal = false;
  this.pendingAssignmentId = null;
  this.selectedSubmitFile = null;
}

confirmSubmitAssignment(): void {
  if (!this.selectedSubmitFile) {
    this.submitFileError = 'Please select a file to submit.';
    return;
  }

  this.submittingAssignment = true;
  const formData = new FormData();
  formData.append('doc_file', this.selectedSubmitFile, this.selectedSubmitFile.name);

  this.assignmentService.submitAssignment(this.pendingAssignmentId!, formData).subscribe({
    next: (res: any) => {
      this.submittingAssignment = false;
      this.showSubmitModal = false;

      // Update attempts
      this.assignmentAttempts = {
        ...this.assignmentAttempts,
        [this.pendingAssignmentId!]: res.data
      };

      if (res.is_late) {
        alert('Assignment submitted successfully! Note: This was a late submission.');
      } else {
        alert('Assignment submitted successfully!');
      }

      this.pendingAssignmentId = null;
      this.selectedSubmitFile = null;
      this.cdr.detectChanges();
    },
    error: (err) => {
      this.submittingAssignment = false;
      if (err.status === 409) {
        alert('You have already submitted this assignment.');
      } else {
        alert('Failed to submit assignment. Please try again.');
      }
    }
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
      // ✅ Pehle quizzes set karo phir attempts check karo
      this.checkAllAttempts();
    },
     error: (err) => {
      console.error('❌ Quiz API error status:', err.status);
      console.error('❌ Quiz API error body:', err.error);
      console.error('❌ Full error:', err);
      this.quizzesLoading = false;
      this.quizzesLoaded = true;
      this.cdr.detectChanges();
    }
  });
}

// checkAllAttempts(): void {
//   if (this.quizzes.length === 0) {
//     this.quizzesLoading = false;
//     this.cdr.detectChanges();
//     return;
//   }

//   let completed = 0;
//   const total = this.quizzes.length;

//   this.quizzes.forEach(quiz => {
//     this.courseService.checkQuizAttempt(quiz.id).subscribe({
//       next: (res: any) => {
//         if (res.attempted) {
//           // ✅ Spread operator — Angular naya object detect karega
//           this.quizAttempts = {
//             ...this.quizAttempts,
//             [quiz.id]: res.attempt.status
//           };
//         }
//         completed++;
//         if (completed === total) {
//           this.quizzesLoading = false;
//           this.cdr.detectChanges();
//         }
//       },
//       error: () => {
//         completed++;
//         if (completed === total) {
//           this.quizzesLoading = false;
//           this.cdr.detectChanges();
//         }
//       }
//     });
//   });
// }
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

  // isOverdue(dueDate: string): boolean {
  //   if (!dueDate) return false;
  //   return new Date(dueDate) < new Date();
  // }

  isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;

  const due = new Date(dueDate);

  if (!dueDate.includes('T') && !dueDate.includes(' ')) {
    due.setHours(23, 59, 59, 999);
  }

  return due < new Date();
}
  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }
}
