import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/coursecurriculum.model';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-course-curriculum-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './course-curriculum-add.html',
  styleUrls: ['./course-curriculum-add.css'], 
})
export class CourseCurriculumAdd implements OnInit {
  curriculumForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: Course[] = [];

  // ✅ CKEditor
  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'indent',
      'outdent',
      '|',
      'link',
      '|',
      'blockQuote',
      '|',
      'undo',
      'redo',
    ],
  };

  //  Quill (commented out)
  // quillModules = {
  //   toolbar: [
  //     ['bold', 'italic', 'underline', 'strike'],
  //     ['blockquote', 'code-block'],
  //     [{ list: 'ordered' }, { list: 'bullet' }],
  //     [{ indent: '-1' }, { indent: '+1' }],
  //     [{ header: [1, 2, 3, 4, 5, 6, false] }],
  //     [{ color: [] }, { background: [] }],
  //     [{ font: [] }],
  //     [{ align: [] }],
  //     ['link', 'image', 'video'],
  //     ['clean'],
  //   ],
  // };

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
      documents: [''],
      description: [''],
      duration: [''],
      status: ['active'],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.curriculumForm.patchValue({
        documents: this.selectedFile.name,
      });
    }
  }

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

  onSubmit(): void {
    if (this.curriculumForm.invalid) {
      this.markFormGroupTouched(this.curriculumForm);
      this.toastService.error('Validation', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    const type = this.curriculumForm.get('type')?.value;

    Object.keys(this.curriculumForm.value).forEach((key) => {
      const value = this.curriculumForm.value[key];
      if (key !== 'documents') {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    if (type === 'reading' || type === 'assignment') {
      if (this.selectedFile) {
        formData.append('documents', this.selectedFile, this.selectedFile.name);
      }
    } else if (type === 'video') {
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

  cancel(): void {
    this.router.navigate(['/admin/course-curriculum/list']);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get f() {
    return this.curriculumForm.controls;
  }
}
