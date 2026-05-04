import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { CourseApiResponse, Instructor } from '../../../../../models/course.model';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CKEditorModule],
  templateUrl: './course-edit.html',
})
export class CourseEdit implements OnInit {
  courseForm!: FormGroup;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  courseId!: number;
  selectedFile: File | null = null;
  isEditMode: boolean = true;
   public Editor: any = ClassicEditor;
      public editorConfig = {
        toolbar: [
          'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
          '|', 'link', 'bulletedList', 'numberedList',
          '|', 'blockQuote', '|', 'undo', 'redo', '|','codeBlock'
        ],
      };


  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
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
      discounted_fee: [''],
      course_level: [''],
      age_limit: [''],
      start_date: [''],
      end_date: [''],
      status: ['active', Validators.required],
      is_featured: [false],
      thumbnail_image: [''],
      benefits: [''],
      short_description: [''],
    });
  }

  // Helper function: Path se ganda naam hatane ke liye
  getFileName(fullPath: any): string {
    if (!fullPath || typeof fullPath !== 'string') return 'No file selected';
    const name = fullPath.split(/[\\/]/).pop();
    if (name?.startsWith('php') && name?.endsWith('.tmp')) {
      return 'Current Thumbnail';
    }
    return name || 'Current Image';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.cdr.detectChanges();
    }
  }



  loadCourse(): void {
    this.courseService.getCourse(this.courseId).subscribe({
      next: (res: CourseApiResponse) => {
        const course = res.data as any;
        this.courseForm.patchValue({
          ...course,
          is_featured: !!course.is_featured,
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to load course');
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) return;

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Method Spoofing

    Object.keys(this.courseForm.value).forEach((key) => {
      if (key !== 'thumbnail_image') {
        let value = this.courseForm.value[key];
        if (typeof value === 'boolean') value = value ? '1' : '0';
        if (value !== null && value !== undefined) formData.append(key, value);
      }
    });

    if (this.selectedFile) {
      formData.append('thumbnail_image', this.selectedFile);
    }

    this.courseService.updateCourse(this.courseId, formData as any).subscribe({
      next: (res) => {
        this.toast.success('Success', res.message || 'Updated');
        this.router.navigate(['/admin/course/list']);
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Update failed');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancel = () => this.router.navigate(['/admin/course/list']);
}
