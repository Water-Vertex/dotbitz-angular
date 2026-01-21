import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../../../../services/course.service';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course, CoursePayload } from '../../../../../models/course.model';

@Component({
  selector: 'app-course-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-add.html'
})
export class CourseAdd implements OnInit {

  courseForm!: FormGroup;
  isSubmitting: boolean = false;
  instructors: { id: number; first_name: string; last_name: string }[] = [];
  isLoadingInstructors: boolean = true;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInstructors();
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      course_name: ['', [Validators.required, Validators.minLength(3)]],
      course_code: ['', Validators.required],
      course_description: [''],
      course_duration: [''],
      course_fee: [''],
      course_level: [''],
      start_date: [''],
      end_date: [''],
      status: ['active'],
      is_featured: [false],
      instructor_id: ['', Validators.required],
      thumbnail_image: [''],
    });
  }

  // Fetch instructors dynamically from API
  loadInstructors(): void {
    this.instructorService.getInstructors().subscribe({
      next: (res) => {
        this.instructors = Array.isArray(res.data) ? res.data : [];
        this.isLoadingInstructors = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to load instructors');
        this.isLoadingInstructors = false;
      }
    });
  }

  get instructor_id() { return this.courseForm.get('instructor_id'); }
  get course_name() { return this.courseForm.get('course_name'); }
  get course_code() { return this.courseForm.get('course_code'); }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    this.courseService.createCourse(this.courseForm.value).subscribe({
      next: res => {
        this.toast.success('Success', res.message || 'Course added successfully');
        this.router.navigate(['/admin/course/list']);
      },
      error: err => {
        this.toast.error('Error', err.error?.message || 'Failed to add course');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/course/list']);
  }
}
