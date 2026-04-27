import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../../../services/assignment.service';

@Component({
  selector: 'app-instructor-assignment-attempts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assignment-attempts.html',
})
export class InstructorAssignmentAttempts implements OnInit {

  courses: any[] = [];
  batches: any[] = [];
  students: any[] = [];
  assignments: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;

  loadingCourses = false;
  loadingBatches = false;
  loadingStudents = false;

  // Grading modal
  showGradeModal = false;
  gradingAttempt: any = null;
  gradeMarks: number = 0;
  gradingAssignment: any = null;
  gradeRemarks: string = '';
  grading = false;

  constructor(
    private assignmentService: AssignmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.assignmentService.getInstructorCourses().subscribe({
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
    this.assignments = [];

    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.assignmentService.getInstructorBatchesByCourse(this.selectedCourseId).subscribe({
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
    this.assignments = [];
    if (!this.selectedCourseId || !this.selectedBatchId) return;
    this.loadStudentStatus();
  }

  loadStudentStatus(): void {
    this.loadingStudents = true;
    this.assignmentService.getInstructorAssignmentBatchStatus({
      course_id: this.selectedCourseId,
      batch_id: this.selectedBatchId,
    }).subscribe({
      next: (res: any) => {
        this.students = res.data?.students || [];
        this.assignments = res.data?.assignments || [];
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingStudents = false; }
    });
  }

  getAttempt(student: any, assignmentId: number): any {
    const found = student.assignments?.find((a: any) => a.assignment_id === assignmentId);
    return found || null;
  }

  getStatus(student: any, assignmentId: number): string {
    const found = this.getAttempt(student, assignmentId);
    return found?.status || 'not_attempted';
  }

  getSubmissionRate(): number {
    if (this.students.length === 0 || this.assignments.length === 0) return 0;

    let totalAttempts = 0;
    let submittedAttempts = 0;

    this.students.forEach(student => {
      this.assignments.forEach(assignment => {
        totalAttempts++;
        const status = this.getStatus(student, assignment.id);
        if (status === 'submitted' || status === 'late') {
          submittedAttempts++;
        }
      });
    });

    return totalAttempts > 0 ? Math.round((submittedAttempts / totalAttempts) * 100) : 0;
  }

  getAverageMarks(): number {
    let totalPercentage = 0;
    let gradedAttempts = 0;

    this.students.forEach(student => {
      this.assignments.forEach(assignment => {
        const attempt = this.getAttempt(student, assignment.id);
        if (attempt?.attempt?.marks !== null && attempt?.attempt?.marks !== undefined && assignment.total_marks > 0) {
          totalPercentage += (attempt.attempt.marks / assignment.total_marks) * 100;
          gradedAttempts++;
        }
      });
    });

    return gradedAttempts > 0 ? Math.round(totalPercentage / gradedAttempts) : 0;
  }

  onGrade(student: any, assignmentId: number): void {
    const found = this.getAttempt(student, assignmentId);
    if (!found?.attempt) return;

     // ✅ Find the correct assignment details
    const currentAssignment = this.assignments.find((a: any) => a.id === assignmentId);

    this.gradingAttempt = found.attempt;
    this.gradeMarks = found.attempt.marks || 0;
    this.gradeRemarks = found.attempt.remarks || '';
    this.gradingAssignment = currentAssignment;  //
    this.gradeMarks = found.attempt.marks || 0;
    this.gradeRemarks = found.attempt.remarks || '';
    this.showGradeModal = true;
    this.cdr.detectChanges();


  }

  cancelGrade(): void {
    this.showGradeModal = false;
    this.gradingAttempt = null;
    this.gradeMarks = 0;
    this.gradingAssignment = null;  // ✅ Cleanup
    this.gradeRemarks = '';
  }

  submitGrade(): void {
    if (!this.gradingAttempt) return;
     const totalMarks = Number(this.gradingAssignment?.total_marks || 0);
    if (this.gradeMarks < 0) {
      alert('Marks cannot be negative.');
      return;
    }
    if (this.gradeMarks > totalMarks) {
      alert(`Obtained marks cannot exceed total marks (${totalMarks}).`);
      return;
    }
    this.grading = true;
    this.assignmentService.gradeInstructorAssignment(this.gradingAttempt.id, {
      marks: this.gradeMarks,
      remarks: this.gradeRemarks,
    }).subscribe({
      next: () => {
        this.grading = false;
        this.showGradeModal = false;

        // Update local data
        this.students = this.students.map(student => {
          student.assignments = student.assignments.map((a: any) => {
            if (a.attempt?.id === this.gradingAttempt.id) {
              a.attempt.marks = this.gradeMarks;
              a.attempt.remarks = this.gradeRemarks;
            }
            return a;
          });
          return student;
        });

        this.cdr.detectChanges();
        this.gradingAttempt = null;
      },
      error: () => {
        this.grading = false;
        alert('Failed to grade assignment.');
      }
    });
  }

  getBaseUrl(): string {
    return window.location.hostname === 'localhost'
      ? 'http://localhost:8000'
      : 'https://dotbitz.com/public';
  }

  getDaysLate(submittedAt: string, dueDate: string): string {
    if (!submittedAt || !dueDate) return '';
    const diff = new Date(submittedAt).getTime() - new Date(dueDate).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} day(s) late` : '';
  }
}
