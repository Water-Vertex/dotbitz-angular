import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../../services/course.service';
import { GuardianService } from '../../../../../services/guardian.service';

@Component({
  selector: 'app-student-result',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-result.html',
  styleUrls: ['./student-result.css']
})
export class StudentResult implements OnInit {

  // ── Step 0: Student selection ──────────────────
  students: any[]          = [];
  selectedStudent: any     = null;
  loadingStudents          = false;

  // ── Step 1: Courses list ───────────────────────
  courses: any[]           = [];
  loadingCourses           = false;

  // ── Step 2: Selected course + tab ─────────────
  selectedCourse: any      = null;
  activeTab: 'quiz' | 'assignment' = 'quiz';

  // ── Step 3: Results ───────────────────────────
  quizResults: any[]       = [];
  assignmentResults: any[] = [];
  loadingQuiz              = false;
  loadingAssignment        = false;

  // ── Step 4: Quiz view modal ────────────────────
  showQuizView             = false;
  viewingAttempt: any      = null;
  loadingView              = false;

  constructor(
    private courseService: CourseService,
    private guardianService: GuardianService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loadingStudents = true;
    this.guardianService.getGuardianStudents().subscribe({
      next: (res: any) => {
        this.students        = res.students || [];
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingStudents = false; }
    });
  }

  selectStudent(student: any): void {
    this.selectedStudent   = student;
    this.selectedCourse    = null;
    this.courses           = [];
    this.quizResults       = [];
    this.assignmentResults = [];
    this.loadCourses();
  }

  backToStudents(): void {
    this.selectedStudent   = null;
    this.selectedCourse    = null;
    this.courses           = [];
    this.quizResults       = [];
    this.assignmentResults = [];
  }



  loadCourses(): void {
    if (!this.selectedStudent) return;
    this.loadingCourses = true;
    this.courseService.getGuardianStudentResultCourses(this.selectedStudent.id).subscribe({
      next: (res: any) => {
        this.courses        = res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCourses = false; }
    });
  }

  selectCourse(course: any): void {
    this.selectedCourse    = course;
    this.quizResults       = [];
    this.assignmentResults = [];
    this.activeTab         = 'quiz';
    this.loadQuizResults();
    this.loadAssignmentResults();
  }

  backToCourses(): void {
    this.selectedCourse    = null;
    this.quizResults       = [];
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
    if (!this.selectedCourse || !this.selectedStudent) return;
    this.loadingQuiz = true;
    this.courseService
      .getGuardianQuizResults(this.selectedStudent.id, this.selectedCourse.id)
      .subscribe({
        next: (res: any) => {
          this.quizResults = res.data || [];
          this.loadingQuiz = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loadingQuiz = false; }
      });
  }

  loadAssignmentResults(): void {
    if (!this.selectedCourse || !this.selectedStudent) return;
    this.loadingAssignment = true;
    this.courseService
      .getGuardianAssignmentResults(this.selectedStudent.id, this.selectedCourse.id)
      .subscribe({
        next: (res: any) => {
          this.assignmentResults = res.data || [];
          this.loadingAssignment = false;
          this.cdr.detectChanges();
        },
        error: () => { this.loadingAssignment = false; }
      });
  }

  viewQuiz(attemptId: number): void {
    this.loadingView  = true;
    this.showQuizView = true;
    this.courseService.getGuardianCheckedQuizDetail(attemptId).subscribe({
      next: (res: any) => {
        this.viewingAttempt = res.data;
        this.loadingView    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingView = false;
        alert('Failed to load quiz details.');
      }
    });
  }

  closeQuizView(): void {
    this.showQuizView   = false;
    this.viewingAttempt = null;
  }

  getAnswerStatus(answer: any): string {
    return answer?.status || 'pending';
  }

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

  getOverallSummary(): { totalMarks: number; obtained: number; percent: number } {
    let totalMarks = 0;
    let obtained   = 0;
    this.quizResults.forEach(r => {
      totalMarks += Number(r.total_marks || 0);
      obtained   += Number(r.obtained_marks || 0);
    });
    this.assignmentResults.forEach(r => {
      totalMarks += Number(r.total_marks || 0);
      obtained   += Number(r.obtained_marks || 0);
    });
    const percent = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalMarks, obtained, percent };
  }

  getQuizSummary(): { totalMarks: number; obtained: number; percent: number } {
    const totalMarks = this.quizResults.reduce((s, r) => s + Number(r.total_marks || 0), 0);
    const obtained   = this.quizResults.reduce((s, r) => s + Number(r.obtained_marks || 0), 0);
    const percent    = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalMarks, obtained, percent };
  }

  getAssignmentSummary(): { totalMarks: number; obtained: number; percent: number } {
    const totalMarks = this.assignmentResults.reduce((s, r) => s + Number(r.total_marks || 0), 0);
    const obtained   = this.assignmentResults.reduce((s, r) => s + Number(r.obtained_marks || 0), 0);
    const percent    = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    return { totalMarks, obtained, percent };
  }
  // --- Ye function missing tha, ise add karein ---
  onStudentDropdownChange(event: any): void {
    const studentId = event.target.value;
    // Dropdown se id milti hai, usse student object find karke selectStudent call karein
    const student = this.students.find(s => s.id == studentId);
    if (student) {
      this.selectStudent(student);
    } else {
      this.backToStudents();
    }
  }
}
