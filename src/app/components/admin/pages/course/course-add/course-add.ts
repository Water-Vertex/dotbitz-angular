import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../../../../services/course.service';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-course-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-add.html',
})
export class CourseAdd implements OnInit {
  courseForm!: FormGroup;
  isSubmitting = false;
  instructors: { id: number; first_name: string; last_name: string }[] = [];
  isLoadingInstructors = true;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      course_name: ['', [Validators.required, Validators.minLength(3)]],
      course_code: ['', Validators.required],
      course_description: [''],
      course_duration: [''],
      course_fee: [''],
      course_level: [''],
      age_limit: [''],
      start_date: [''],
      end_date: [''],
      status: ['active'],
      is_featured: [false],
      instructor_id: ['', Validators.required],
      thumbnail_image: [''],
    });

    this.loadInstructors();
  }

  loadInstructors() {
    this.instructorService.getInstructors().subscribe({
      next: (res) => {
        this.instructors = Array.isArray(res.data) ? res.data : [];
        this.isLoadingInstructors = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to load instructors');
        this.isLoadingInstructors = false;
      },
    });
  }

  get instructor_id() {
    return this.courseForm.get('instructor_id');
  }
  get course_name() {
    return this.courseForm.get('course_name');
  }
  get course_code() {
    return this.courseForm.get('course_code');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]; // Capture it in a local constant

    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges();
      };
      // Use the local 'file' constant which TypeScript knows is not null
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    // Iterate through form controls
    Object.keys(this.courseForm.value).forEach((key) => {
      if (key !== 'thumbnail_image') {
        let value = this.courseForm.value[key];

        // FIX: Convert booleans to '1' or '0'
        // FormData sends everything as a string; '1'/'0' is the safest format for APIs
        if (typeof value === 'boolean') {
          value = value ? '1' : '0';
        }

        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    // Append file safely
    if (this.selectedFile) {
      formData.append('thumbnail_image', this.selectedFile, this.selectedFile.name);
    }

    // Submit
    this.courseService.createCourse(formData).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message || 'Course added successfully');
        this.router.navigate(['/admin/course/list']);
      },
      error: (err) => {
        // Improved error logging to help you see the "1 more error"
        console.error('Upload error:', err);
        this.toast.error('Error', err.error?.message || 'Failed to add course');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  cancel() {
    this.router.navigate(['/admin/course/list']);
  }
}
