import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { CourseApiResponse, Instructor } from '../../../../../models/course.model';

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-edit.html'
})
export class CourseEdit implements OnInit {

  courseForm!: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  courseId!: number;
  instructors: Instructor[] = [];
  isEditMode: boolean = true;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadInstructors();
    this.loadCourse();
  }

  initForm(): void {
    this.courseForm = this.fb.group({
      course_name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', Validators.required],
      course_code: ['', Validators.required],
      course_description: [''],
      course_duration: [''],
      course_fee: [''],
      course_level: [''],
      start_date: [''],
      end_date: [''],
      status: ['active', Validators.required],
      is_featured: [false],
      instructor_id: ['', Validators.required],
      thumbnail_image: [''],
    });
  }


loadInstructors() {
  this.courseService.getInstructors().subscribe({
    next: (res) => {
      console.log('Instructors Response:', res); // <-- check the response here
      this.instructors = res.data; 
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Failed to load instructors:', err); // <-- check error object
      this.toast.error('Error', 'Failed to load instructors');
      this.isLoading = false; // stop loading if instructors fail
    }
  });
}

  loadCourse(): void {
    this.courseService.getCourse(this.courseId).subscribe({
  next: (res: CourseApiResponse) => {
    const course = res.data as any; // cast to any for now if you need
    this.courseForm.patchValue({
      course_name: course.course_name,
      slug: course.slug,
      course_code: course.course_code,
      course_description: course.course_description,
      course_duration: course.course_duration,
      course_fee: course.course_fee,
      course_level: course.course_level,
      start_date: course.start_date,
      end_date: course.end_date,
      status: course.status || 'active',
      is_featured: course.is_featured,
      instructor_id: course.instructor_id, // should be number
      thumbnail_image: course.thumbnail_image
    });
    this.isLoading = false;
    this.cdr.detectChanges();
  },
  error: () => {
    this.toast.error('Error', 'Failed to load course details');
    this.isLoading = false;
  }
});
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    this.courseService.updateCourse(this.courseId, this.courseForm.value).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message || 'Course updated successfully');
        this.router.navigate(['/admin/course/list']);
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Failed to update course');
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
