import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignCourseService } from '../../../../../../services/assigncourse.service';
import { CourseService } from '../../../../../../services/course.service';
import { InstructorService } from '../../../../../../services/instructor.service';

@Component({
  selector: 'app-assign-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assign-edit.html',
})
export class AssignCourseEdit implements OnInit {

  assignmentId!: number;
  courses: any[] = [];
  instructors: any[] = [];

  selectedCourseId: number | null = null;
  selectedInstructorId: number | null = null;

  loadingCourses = false;
  loadingInstructors = false;
  loadingAssignment = false;
  submitting = false;

  constructor(
    private assignCourseService: AssignCourseService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourses();
    this.loadInstructors();
    this.loadAssignment();
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

  loadAssignment(): void {
    this.loadingAssignment = true;
    this.assignCourseService.getAssignment(this.assignmentId).subscribe({
      next: (res: any) => {
        const assignment = res.data;
        this.selectedCourseId     = assignment.course_id;
        this.selectedInstructorId = assignment.instructor_id;
        this.loadingAssignment    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingAssignment = false;
        alert('Failed to load assignment.');
        this.router.navigate(['/admin/course/assign-list']);
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

    this.assignCourseService.updateAssignment(this.assignmentId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Assignment updated successfully!');
          this.router.navigate(['/admin/assign-course/list']);
        }
      },
      error: (err: any) => {
        this.submitting = false;
        if (err.status === 409) {
          alert('This instructor is already assigned to this course!');
        } else {
          alert('Failed to update assignment.');
        }
        console.error(err);
      }
    });
  }
}