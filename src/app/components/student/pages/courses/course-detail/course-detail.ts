import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../services/course.service';
import { StudentService } from '../../../../../services/student.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.html',
})
export class StudentCourseDetail implements OnInit {
  course: any = null;
  id!: string;
  loading = false;

  // Enrollment eligibility
  eligibilityChecked = false;
  isEligibleForEnrollment = false;
  showParentMessage = false;
  enrollmentMessage = '';
  studentAge: number | null = null;
  assessmentCompleted = false;
  enrolledat = false;
  isEnrolling = false;
  studentData: any = null;
  alreadyEnrolled: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private studentService: StudentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // First get the logged-in student data
    this.getStudentProfile();

    // Subscribe to route changes
    this.route.paramMap.subscribe((params) => {
      const newId = params.get('id');
      if (newId) {
        this.id = newId;
        this.getCourseDetail();
      }
    });
  }

  // Get logged-in student profile
  getStudentProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (res: any) => {
        this.studentData = res.data || res;
        console.log('Student profile loaded:', this.studentData);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading student profile:', err);
      }
    });
  }

  getCourseDetail() {
    this.loading = true;
    this.course = null;
    // Reset eligibility flags
    this.eligibilityChecked = false;
    this.isEligibleForEnrollment = false;

    this.courseService.getCourseDetail(+this.id).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.loading = false;

        // Check enrollment eligibility if course is active and we have student data
        if (this.course && this.course.status === 'active' && this.studentData) {
          this.checkEnrollmentEligibility();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Student Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Check student enrollment eligibility
  checkEnrollmentEligibility(): void {
    if (!this.studentData) {
      this.eligibilityChecked = true;
      this.showParentMessage = true;
      this.enrollmentMessage = 'Please login to enroll in this course.';
      this.cdr.detectChanges();
      return;
    }

    // Calculate age from student's date of birth
    this.studentAge = this.calculateAge(this.studentData.date_of_birth);

    if (this.studentAge < 18) {
      // Under 18 - Not eligible
      this.isEligibleForEnrollment = false;
      this.showParentMessage = true;
      this.enrollmentMessage = 'You are under 18. Please ask your parent/guardian to enroll you in this course.';
      this.eligibilityChecked = true;
      this.cdr.detectChanges();
    } else {
      // Age 18 or above - Check assessment completion
      this.checkAssessmentCompletion(this.studentData.id);
    }
  }

  // Check if student has completed assessment
  checkAssessmentCompletion(studentId: number): void {
    this.courseService.checkStudentAssessmentCompleted(studentId, +this.id).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        // Check if already enrolled
        if (res.already_enrolled) {
          this.alreadyEnrolled = true;
          this.isEligibleForEnrollment = false;
          this.showParentMessage = true;
          this.enrollmentMessage = 'You are already enrolled in this course.';
          this.eligibilityChecked = true;
          this.cdr.detectChanges();
          return;
        }

        this.alreadyEnrolled = false;

        // Check if assessment is completed
        if (res.completed) {
          this.isEligibleForEnrollment = true;
          this.showParentMessage = false;
          this.enrollmentMessage = '';
        } else {
          this.isEligibleForEnrollment = false;
          this.showParentMessage = true;
          this.enrollmentMessage = 'Please complete the assessment before enrolling in this course.';
        }

        this.eligibilityChecked = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error checking assessment completion:', err);
        this.alreadyEnrolled = false;
        this.isEligibleForEnrollment = false;
        this.showParentMessage = true;

        if (err.status === 404) {
          this.enrollmentMessage = 'No assessment found for this course. Please contact support.';
        } else if (err.status === 409) {
          this.alreadyEnrolled = true;
          this.enrollmentMessage = 'You are already enrolled in this course.';
        } else {
          this.enrollmentMessage = 'Unable to verify eligibility. Please try again later.';
        }

        this.eligibilityChecked = true;
        this.cdr.detectChanges();
      }
    });
}

// Optional: Add contact support method
contactSupport(): void {
  // You can open a modal, send email, or navigate to support page
  window.location.href = 'mailto:support@dotbitz.com';
  // Or open a chat modal
  // this.openSupportChat();
}

  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }
}
