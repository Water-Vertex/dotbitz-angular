import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GradeHistoryService } from '../../../../../services/grade.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-instructor-grade',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './grade.html',
})
export class InstructorGrade implements OnInit {

  role: 'admin' | 'instructor' = 'instructor';

  // Data
  courses: any[] = [];
  batches: any[] = [];
  students: any[] = [];
  filteredStudents: any[] = [];

  // Selected
  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;
  selectedCourse: any = null;

  // Search
  searchStudent: string = '';

  // Student detail modal
  showStudentModal = false;
  studentDetail: any = null;
  loadingDetail = false;
  detailTab: 'quiz' | 'assignment' = 'quiz';

  // Loading
  loadingCourses = false;
  loadingBatches = false;
  loadingStudents = false;

  constructor(
    private gradeService: GradeHistoryService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.gradeService.getCourses(this.role).subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCourses = false;
        this.toastService.error('Error', 'Failed to load courses');
      }
    });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.batches = [];
    this.students = [];
    this.filteredStudents = [];
    this.selectedCourse = this.courses.find(c => c.id == this.selectedCourseId) || null;

    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.gradeService.getBatches(this.role, this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res.data || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingBatches = false;
        this.toastService.error('Error', 'Failed to load batches');
      }
    });
  }

  onBatchChange(): void {
    this.students = [];
    this.filteredStudents = [];
    if (!this.selectedCourseId || !this.selectedBatchId) return;
    this.loadStudents();
  }

  loadStudents(): void {
    this.loadingStudents = true;
    this.gradeService.getBatchStudents(this.role, this.selectedCourseId!, this.selectedBatchId!).subscribe({
      next: (res: any) => {
        this.students = res.data || [];
        this.filteredStudents = [...this.students];
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingStudents = false;
        this.toastService.error('Error', 'Failed to load students');
      }
    });
  }

  filterStudents(): void {
    if (!this.searchStudent.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      const term = this.searchStudent.toLowerCase().trim();
      this.filteredStudents = this.students.filter(s =>
        (s.first_name?.toLowerCase().includes(term) ||
         s.last_name?.toLowerCase().includes(term) ||
         s.email?.toLowerCase().includes(term))
      );
    }
  }

  getSelectedBatchName(): string {
    const batch = this.batches.find(b => b.id === this.selectedBatchId);
    return batch?.name || 'N/A';
  }

  getClassAverage(): number {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((sum, s) => sum + (s.overall_percent || 0), 0);
    return Math.round(total / this.students.length);
  }

  getQuizAverage(): number {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((sum, s) => sum + (s.quiz_percent || 0), 0);
    return Math.round(total / this.students.length);
  }

  getAssignmentAverage(): number {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((sum, s) => sum + (s.assign_percent || 0), 0);
    return Math.round(total / this.students.length);
  }

  getPassingRate(): number {
    if (this.students.length === 0) return 0;
    const passed = this.students.filter(s => (s.overall_percent || 0) >= 60).length;
    return Math.round((passed / this.students.length) * 100);
  }

  getTopPerformer(): string {
    if (this.students.length === 0) return 'N/A';
    const top = [...this.students].sort((a, b) => (b.overall_percent || 0) - (a.overall_percent || 0))[0];
    return top ? `${top.first_name} ${top.last_name}` : 'N/A';
  }

  getSubmittedCount(): number {
    return this.students.filter(s => s.quiz_count > 0 || s.assign_count > 0).length;
  }

  getStudentQuizAverage(): number {
    if (!this.studentDetail?.quizzes?.length) return 0;
    const total = this.studentDetail.quizzes.reduce((sum: number, q: any) => sum + (q.percent || 0), 0);
    return Math.round(total / this.studentDetail.quizzes.length);
  }

  getStudentAssignmentAverage(): number {
    if (!this.studentDetail?.assignments?.length) return 0;
    const total = this.studentDetail.assignments.reduce((sum: number, a: any) => sum + (a.percent || 0), 0);
    return Math.round(total / this.studentDetail.assignments.length);
  }

  getStudentOverallGrade(): string {
    const quizAvg = this.getStudentQuizAverage();
    const assignAvg = this.getStudentAssignmentAverage();
    const overall = (quizAvg + assignAvg) / 2;
    return this.getGrade(overall);
  }

  viewStudentProfile(studentId: number): void {
    this.showStudentModal = true;
    this.studentDetail = null;
    this.loadingDetail = true;
    this.detailTab = 'quiz';

    this.gradeService.getStudentDetail(this.role, this.selectedCourseId!, studentId).subscribe({
      next: (res: any) => {
        this.studentDetail = res.data;
        this.loadingDetail = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingDetail = false;
        this.toastService.error('Error', 'Failed to load student profile');
      }
    });
  }

  closeModal(): void {
    this.showStudentModal = false;
    this.studentDetail = null;
  }

  // Grade helpers
  getGrade(percent: number | null): string {
    if (percent === null || percent === undefined) return '-';
    if (percent >= 95) return 'A+';
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'F';
  }

  getGradeBadge(percent: number | null): string {
    if (percent === null || percent === undefined) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (percent >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (percent >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percent >= 70) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  }

  getResultBadgeClass(percent: number | null): string {
    if (percent === null || percent === undefined) return 'bg-gray-100 text-gray-500';
    if (percent >= 90) return 'bg-green-100 text-green-700';
    if (percent >= 80) return 'bg-blue-100 text-blue-700';
    if (percent >= 70) return 'bg-cyan-100 text-cyan-700';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }

  getProgressColor(percent: number | null): string {
    if (!percent) return 'bg-gray-300';
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getScoreColor(percent: number | null): string {
    if (!percent) return 'text-gray-400';
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getPercentColor(percent: number | null): string {
    if (!percent) return 'text-gray-400';
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-blue-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getStatusBadge(percent: number | null): string {
    if (!percent || percent < 60) return 'bg-red-100 text-red-700';
    if (percent < 70) return 'bg-yellow-100 text-yellow-700';
    if (percent < 80) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  }

  getStatusText(percent: number | null): string {
    if (!percent || percent < 60) return 'At Risk';
    if (percent < 70) return 'Needs Improvement';
    if (percent < 80) return 'Satisfactory';
    if (percent < 90) return 'Good';
    return 'Excellent';
  }

  getBaseUrl(): string {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://dotbitz.com/public';
  }
}
