import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignCourseService } from '../../../../../../services/assigncourse.service';
import { CourseService } from '../../../../../../services/course.service';
import { InstructorService } from '../../../../../../services/instructor.service';

@Component({
  selector: 'app-assign-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assign-add.html',
})
export class AssignCourseAdd implements OnInit {

  courses: any[] = [];
  instructors: any[] = [];

  selectedCourseId: number | null = null;
  selectedInstructorId: number | null = null;

  loadingCourses = false;
  loadingInstructors = false;
  submitting = false;

  constructor(
    private assignCourseService: AssignCourseService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadInstructors();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCourses = false;
      }
    });
  }

  loadInstructors(): void {
  this.loadingInstructors = true;
  this.instructorService.getInstructors().subscribe({
    next: (res: any) => {
      // InstructorService response format handle karo
      this.instructors = res?.data?.data || res?.data || res || [];
      this.loadingInstructors = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loadingInstructors = false;
    }
  });
}

  onSubmit(): void {
    if (!this.selectedCourseId || !this.selectedInstructorId) {
      alert('Please select both course and instructor.');
      return;
    }

    this.submitting = true;

    const payload = {
      course_id:     this.selectedCourseId,
      instructor_id: this.selectedInstructorId,
    };

    this.assignCourseService.createAssignment(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Instructor assigned successfully!');
          this.router.navigate(['/admin/course/assign-list']);
        }
      },
      error: (err: any) => {
        this.submitting = false;
        if (err.status === 409) {
          alert('This instructor is already assigned to this course!');
        } else {
          alert('Failed to assign instructor. Please try again.');
        }
        console.error(err);
      }
    });
  }
}
