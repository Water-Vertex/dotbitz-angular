import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-my-result',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-result.html',
})
export class MyResult implements OnInit {

  // Step 1 — Courses list
  courses: any[] = [];
  loadingCourses = false;

  // Step 2 — Selected course + active tab
  selectedCourse: any = null;
  activeTab: 'quiz' | 'assignment' = 'quiz';

  // Step 3 — Results
  quizResults: any[] = [];
  assignmentResults: any[] = [];
  loadingQuiz = false;
  loadingAssignment = false;

  // Step 4 — Quiz view modal
  showQuizView = false;
  viewingAttempt: any = null;
  loadingView = false;
  reattempting: number | null = null; 

constructor(
  private courseService: CourseService,
  private cdr: ChangeDetectorRef,
  private router: Router
) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getMyResultCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCourses = false; }
    });
  }

  selectCourse(course: any): void {
    this.selectedCourse = course;
    this.quizResults = [];
    this.assignmentResults = [];
    this.activeTab = 'quiz';
    this.loadQuizResults();
    this.loadAssignmentResults();
  }

  backToCourses(): void {
    this.selectedCourse = null;
    this.quizResults = [];
    this.assignmentResults = [];
  }

  setTab(tab: 'quiz' | 'assignment'): void {
    this.activeTab = tab;
    if (tab === 'quiz' && this.quizResults.length === 0) {
      this.loadQuizResults();
    }
    if (tab === 'assignment' && this.assignmentResults.length === 0) {
      this.loadAssignmentResults();
    }
  }

  loadQuizResults(): void {
    if (!this.selectedCourse) return;
    this.loadingQuiz = true;
    this.courseService.getQuizResults(this.selectedCourse.id).subscribe({
      next: (res: any) => {
        this.quizResults = res.data || [];
        this.loadingQuiz = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingQuiz = false; }
    });
  }

  loadAssignmentResults(): void {
    if (!this.selectedCourse) return;
    this.loadingAssignment = true;
    this.courseService.getAssignmentResults(this.selectedCourse.id).subscribe({
      next: (res: any) => {
        this.assignmentResults = res.data || [];
        this.loadingAssignment = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingAssignment = false; }
    });
  }

  viewQuiz(attemptId: number): void {
    this.loadingView = true;
    this.showQuizView = true;

    this.courseService.getCheckedQuizDetail(attemptId).subscribe({
      next: (res: any) => {
        this.viewingAttempt = res.data;
        this.loadingView = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingView = false;
        alert('Failed to load quiz details.');
      }
    });
  }

  closeQuizView(): void {
    this.showQuizView = false;
    this.viewingAttempt = null;
  }

  getAnswerStatus(answer: any): string {
    return answer?.status || 'pending';
  }

  // Helper methods for colors and formatting
  getPercentColor(percent: number): string {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getProgressColor(percent: number): string {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getGrade(percent: number): string {
    if (percent >= 95) return 'A+';
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'F';
  }

  getGradeBadgeColor(percent: number): string {
    if (percent >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (percent >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percent >= 70) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  }

  getScoreColor(percent: number): string {
    if (!percent) return 'text-gray-400';
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getOverallSummary(): { totalMarks: number; obtained: number; percent: number } {
    let totalMarks = 0;
    let obtained = 0;

    this.quizResults.forEach(r => {
      totalMarks += Number(r.total_marks || 0);
      obtained += Number(r.obtained_marks || 0);
    });

    this.assignmentResults.forEach(r => {
      totalMarks += Number(r.total_marks || 0);
      obtained += Number(r.obtained_marks || 0);
    });

    const percent = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalMarks, obtained, percent };
  }

  getQuizSummary(): { totalMarks: number; obtained: number; percent: number } {
    const totalMarks = this.quizResults.reduce((s, r) => s + Number(r.total_marks || 0), 0);
    const obtained = this.quizResults.reduce((s, r) => s + Number(r.obtained_marks || 0), 0);
    const percent = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalMarks, obtained, percent };
  }

  getAssignmentSummary(): { totalMarks: number; obtained: number; percent: number } {
    const totalMarks = this.assignmentResults.reduce((s, r) => s + Number(r.total_marks || 0), 0);
    const obtained = this.assignmentResults.reduce((s, r) => s + Number(r.obtained_marks || 0), 0);
    const percent = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalMarks, obtained, percent };
  }

reattemptQuiz(quizId: number): void {
  if (!confirm('Are you sure you want to reattempt this quiz? Your previous attempt will be reset.')) return;

  this.reattempting = quizId;
  this.courseService.reattemptQuiz(quizId).subscribe({
    next: (res: any) => {
      this.reattempting = null;

      // ✅ localStorage cleanup
      localStorage.removeItem(`quiz_${quizId}_timer`);
      localStorage.removeItem(`quiz_${quizId}_answers`);
      localStorage.removeItem(`quiz_${quizId}_attempt`);
      localStorage.removeItem(`quiz_${quizId}_start_time`);
      localStorage.removeItem(`quiz_${quizId}_remaining`);
      localStorage.removeItem(`quiz_attempt_${quizId}`);

      alert('Reattempt started! You can now take the quiz again.');
      this.router.navigate(['/student/quiz', quizId]);
    },
    error: (err: any) => {
      this.reattempting = null;
      alert(err.error?.message || 'Failed to start reattempt.');
    }
  });
}

canReattempt(percent: number): boolean {
  return percent <= 79;  // C = 70-79, D = 60-69, F = <60
}
}
