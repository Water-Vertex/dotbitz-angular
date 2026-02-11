import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { CourseCurriculum, Course } from '../../../../../models/coursecurriculum.model';
import { QuillModule } from 'ngx-quill';
@Component({
  selector: 'app-course-curriculum-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './course-curriculum-edit.html',
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
      documents: [''], // will be overridden by file upload
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

  /** Load all courses */
  loadCourses(): void {
    this.curriculumService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : [res.data];
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Error', 'Failed to load courses'),
    });
  }

  /** Load curriculum details */
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
          video_url: data.type === 'video' ? data.documents : '', // <-- ye important
          documents: '', // file input ke liye empty
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

  /** Handle file selection */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      // Patch the filename for display (optional)
      this.curriculumForm.patchValue({
        documents: this.selectedFile.name,
      });
    }
  }

  /** Submit updated curriculum */
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

    // Conditional documents: file or video URL
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

  /** Cancel edit */
  cancel(): void {
    this.router.navigate(['/admin/course-curriculum/list']);
  }

  /** Mark all controls touched */
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
