import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/coursecurriculum.model';
import { QuillModule } from 'ngx-quill';
@Component({
  selector: 'app-course-curriculum-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './course-curriculum-add.html',
})
export class CourseCurriculumAdd implements OnInit {
  curriculumForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: Course[] = [];

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'], // blocks
      [{ list: 'ordered' }, { list: 'bullet' }], // lists
      [{ indent: '-1' }, { indent: '+1' }], // indents
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // headers
      [{ color: [] }, { background: [] }], // text color
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  // selected file
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private curriculumService: CourseCurriculumService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.curriculumForm = this.fb.group({
      course_id: ['', Validators.required],
      title: ['', Validators.required],
      type: ['', Validators.required],
      video_url: [''],
      documents: [''], // This acts as a UI placeholder for the filename
      description: [''],
      duration: [''],
      status: ['active'],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  /** ---------- FILE SELECTION ---------- */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Patch the filename to the form so DB gets filename
      this.curriculumForm.patchValue({
        documents: this.selectedFile.name,
      });
    }
  }

  /** ---------- LOAD COURSES ---------- */
  loadCourses(): void {
    this.isLoading = true;
    this.curriculumService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : res || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** ---------- submit ---------- */
  onSubmit(): void {
    if (this.curriculumForm.invalid) {
      this.markFormGroupTouched(this.curriculumForm);
      this.toastService.error('Validation', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    const type = this.curriculumForm.get('type')?.value;

    // Loop through other fields
    Object.keys(this.curriculumForm.value).forEach((key) => {
      const value = this.curriculumForm.value[key];

      if (key !== 'documents') {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    // Handle documents field based on type
    if (type === 'reading' || type === 'assignment') {
      if (this.selectedFile) {
        formData.append('documents', this.selectedFile, this.selectedFile.name);
      }
    } else if (type === 'video') {
      // Save video URL in 'documents' field
      const url = this.curriculumForm.get('video_url')?.value || '';
      formData.append('documents', url);
    }

    this.curriculumService.createCurriculum(formData).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Curriculum added!');
        this.router.navigate(['/admin/course-curriculum/list']);
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || err.message || 'Failed to create';
        this.toastService.error('Error', errorMsg);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** ---------- CANCEL ---------- */
  cancel(): void {
    this.router.navigate(['/admin/course-curriculum/list']);
  }

  /** ---------- HELPER TO MARK FORM CONTROLS AS TOUCHED ---------- */
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  /** ---------- GETTER FOR FORM CONTROLS ---------- */
  get f() {
    return this.curriculumForm.controls;
  }
}
