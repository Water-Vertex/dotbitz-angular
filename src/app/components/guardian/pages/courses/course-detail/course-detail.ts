import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-guardian-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.html',
})
export class GuardianCourseDetail implements OnInit, OnDestroy {

  course: any = null;
  id!: string;
  loading = false;

  // Students
  students: any[] = [];
  selectedStudentId: number | null = null;
  selectedStudentName: string = '';
  studentData: any = null;
  loadingStudents = false;
  showStudentSelector = false;

  // Eligibility
  eligibilityChecked = false;
  isEligibleForEnrollment = false;
  showParentMessage = false;
  enrollmentMessage = '';
  studentAge: number | null = null;
  alreadyEnrolled: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchStudents();

    this.route.paramMap.subscribe((params) => {
      const newId = params.get('id');
      if (newId) {
        this.id = newId;
        this.getCourseDetail();
      }
    });
  }

  // ✅ Fetch Guardian Students
  fetchStudents(): void {
    this.loadingStudents = true;

    this.courseService.getGuardianStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {

          if (res?.students) {
            this.students = res.students;
          } else if (res?.data?.students) {
            this.students = res.data.students;
          } else if (Array.isArray(res?.data)) {
            this.students = res.data;
          } else if (Array.isArray(res)) {
            this.students = res;
          } else {
            this.students = [];
          }

          this.loadingStudents = false;

          // ✅ Handle dropdown / auto-select
          if (this.students.length > 1) {
            this.showStudentSelector = true;
          } else if (this.students.length === 1) {
            this.autoSelectStudent(this.students[0]);
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.loadingStudents = false;
          this.toastService.error('Error', 'Failed to load students');
          this.cdr.detectChanges();
        },
      });
  }

  // ✅ Auto select student
  autoSelectStudent(student: any): void {
    this.selectedStudentId = student.id;
    this.studentData = student;
    this.selectedStudentName = `${student.first_name} ${student.last_name}`;
    this.showStudentSelector = false;

    if (this.course && this.course.status === 'active') {
      this.checkEnrollmentEligibility();
    }
  }

  // ✅ On dropdown change
  onStudentSelect(studentIdValue: string): void {
    const studentId = studentIdValue ? Number(studentIdValue) : null;

    this.selectedStudentId = studentId;

    if (!studentId) {
      this.selectedStudentName = '';
      this.studentData = null;
      this.eligibilityChecked = false;
      return;
    }

    const student = this.students.find(s => s.id === studentId);

    if (student) {
      this.studentData = student;
      this.selectedStudentName = `${student.first_name} ${student.last_name}`;
    }

    // reset flags
    this.eligibilityChecked = false;
    this.isEligibleForEnrollment = false;
    this.alreadyEnrolled = false;
    this.showParentMessage = false;

    if (this.course && this.course.status === 'active') {
      this.checkEnrollmentEligibility();
    }
  }

  // ✅ Get Course Detail
  getCourseDetail(): void {
    this.loading = true;
    this.course = null;
    this.eligibilityChecked = false;

    this.courseService.getGuardianCourseDetail(+this.id)
      .subscribe({
        next: (res: any) => {
          this.course = res.data;
          this.loading = false;

          if (this.course?.status === 'active' && this.studentData) {
            this.checkEnrollmentEligibility();
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

  // ✅ Calculate Age
  calculateAge(dob: string): number {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // ✅ Eligibility Logic (MAIN FIX)
  checkEnrollmentEligibility(): void {

    if (!this.studentData) {
      this.showParentMessage = true;
      this.enrollmentMessage = 'Please select a student first.';
      this.eligibilityChecked = true;
      return;
    }

    this.studentAge = this.calculateAge(this.studentData.date_of_birth);

    // ✅ Guardian logic
    if (this.studentAge < 18) {
      this.isEligibleForEnrollment = true;
      this.showParentMessage = false;
      this.enrollmentMessage = '';
      this.eligibilityChecked = true;
      this.cdr.detectChanges();
    } else {
      this.checkAssessmentCompletion();
    }
  }

  // ✅ Assessment Check
  checkAssessmentCompletion(): void {

    this.courseService
      .checkStudentAssessmentCompleted(this.selectedStudentId!, +this.id)
      .subscribe({
        next: (res: any) => {

          if (res.already_enrolled) {
            this.alreadyEnrolled = true;
            this.isEligibleForEnrollment = false;
            this.showParentMessage = true;
            this.enrollmentMessage = `${this.selectedStudentName} is already enrolled in this course.`;
            this.eligibilityChecked = true;
            this.cdr.detectChanges();
            return;
          }

          this.alreadyEnrolled = false;

          if (res.completed) {
            this.isEligibleForEnrollment = true;
            this.showParentMessage = false;
            this.enrollmentMessage = '';
          } else {
            this.isEligibleForEnrollment = false;
            this.showParentMessage = true;
            this.enrollmentMessage = `${this.selectedStudentName} needs to complete the assessment first.`;
          }

          this.eligibilityChecked = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Assessment error:', err);

          this.isEligibleForEnrollment = false;
          this.showParentMessage = true;
          this.enrollmentMessage = 'Unable to verify eligibility.';
          this.eligibilityChecked = true;

          this.cdr.detectChanges();
        }
      });
  }

  // ✅ Benefits
  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
