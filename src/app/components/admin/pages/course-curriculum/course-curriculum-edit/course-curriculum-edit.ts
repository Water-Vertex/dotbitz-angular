import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { CourseCurriculum, Course } from '../../../../../models/coursecurriculum.model';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-course-curriculum-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './course-curriculum-edit.html',
  styleUrls: ['./course-curriculum-edit.css'],  
})
export class CourseCurriculumEdit implements OnInit, OnDestroy {
  curriculumForm: FormGroup;
  curriculumId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  courses: Course[] = [];
  existingDocument: string | null = null;
  selectedFile: File | null = null;
  private routeSub: Subscription | undefined;

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

  // ❌ Quill (commented out)
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

  constructor(
    private fb: FormBuilder,
    private curriculumService: CourseCurriculumService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.curriculumForm = this.fb.group({
      course_id: [null, Validators.required],
      title: ['', Validators.required],
      type: ['', Validators.required],
      video_url: [''],
      documents: [''],
      description: [''],
      duration: [''],
    });
  }

  ngOnInit(): void {
    this.loadCourses();

    this.routeSub = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !isNaN(id)) {
        this.curriculumId = +id;
        this.loadCurriculum(this.curriculumId);
      } else {
        this.toastService.error('Error', 'Invalid Curriculum ID');
        this.router.navigate(['/admin/course-curriculum/list']);
      }
    });
  }

  loadCourses(): void {
    this.curriculumService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : [res.data];
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Error', 'Failed to load courses'),
    });
  }

  loadCurriculum(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.curriculumService.getCurriculum(id).subscribe({
      next: (res: any) => {
        const data: CourseCurriculum = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!data) {
          this.toastService.error('Error', 'Curriculum not found');
          this.router.navigate(['/admin/course-curriculum/list']);
          return;
        }

        this.existingDocument = data.documents || null;

        this.curriculumForm.patchValue({
          course_id: data.course_id,
          title: data.title,
          type: data.type,
          video_url: data.type === 'video' ? data.documents : '',
          documents: '',
          description: data.description || '',
          duration: data.duration || '',
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load curriculum');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
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

  onSubmit(): void {
    if (this.curriculumForm.invalid || !this.curriculumId) {
      this.markFormGroupTouched(this.curriculumForm);
      this.toastService.error('Validation', 'Please fill all required fields.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    const value = this.curriculumForm.value;

    formData.append('course_id', value.course_id);
    formData.append('title', value.title);
    formData.append('type', value.type);
    formData.append('description', value.description || '');
    formData.append('duration', value.duration || '');

    if (value.type === 'video') {
      formData.append('documents', value.video_url || '');
    } else if (this.selectedFile) {
      formData.append('documents', this.selectedFile);
    }

    this.curriculumService.updateCurriculum(this.curriculumId, formData).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Curriculum updated successfully!');
        this.router.navigate(['/admin/course-curriculum/list']);
      },
      error: (err: any) => {
        this.toastService.error('Error', err.message || 'Failed to update curriculum');
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
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}
