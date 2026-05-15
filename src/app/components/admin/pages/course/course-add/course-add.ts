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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-course-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CKEditorModule],
  templateUrl: './course-add.html',
})
export class CourseAdd implements OnInit {
  courseForm!: FormGroup;
  isSubmitting = false;
  instructors: { id: number; first_name: string; last_name: string }[] = [];
  isLoadingInstructors = true;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  public Editor: any = ClassicEditor;
    public editorConfig = {
      toolbar: [
        'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
        '|', 'link', 'bulletedList', 'numberedList',
        '|', 'blockQuote', '|', 'undo', 'redo',
      ],
    };

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
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
      discounted_fee: [''],
      course_level: [''],
      age_limit: [''],
      start_date: [''],
      end_date: [''],
      status: ['active'],
      is_featured: [false],
      thumbnail_image: [''],
      benefits: [''],
      short_description: [''],

       classes_per_week:  [''],
      total_classes:     [''],
      course_hours:      [''],
      meta_title: [''],
meta_description: [''],
meta_keyword: [''],
meta_tags: [''],
focus_keyword: [''],
page_schema: [''],
    });

  }



  get course_name() {
    return this.courseForm.get('course_name');
  }
  get course_code() {
    return this.courseForm.get('course_code');
  }

  calculateTotals(): void {
    const startDate      = this.courseForm.get('start_date')?.value;
    const endDate        = this.courseForm.get('end_date')?.value;
    const classesPerWeek = Number(this.courseForm.get('classes_per_week')?.value);
    const hoursPerClass  = Number(this.courseForm.get('course_duration')?.value);

    if (!startDate || !endDate || !classesPerWeek || !hoursPerClass) return;

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end <= start) return;

    const diffMs     = end.getTime() - start.getTime();
    const totalWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));

    const totalClasses = totalWeeks * classesPerWeek;
    const totalHours   = totalClasses * hoursPerClass;

    this.courseForm.patchValue({
      total_classes: totalClasses,
      course_hours:  totalHours.toString(),
    }, { emitEvent: false });

    this.cdr.detectChanges();
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
