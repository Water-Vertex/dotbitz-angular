import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssignmentService } from '../../../../../services/assignment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/assignment.model';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-assignment-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './assignment-add.html',
  styleUrls: ['./assignment-add.css'],
 
})
export class AssignmentAdd implements OnInit {
  assignmentForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: Course[] = [];
  selectedFile: File | null = null;

  // CKEditor
  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'blockQuote',
      '|',
      'undo',
      'redo',
    ],
  };

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    public router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.assignmentForm = this.fb.group({
      course_id: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      assignment_file: [''],
      due_date: ['', Validators.required],
      total_marks: [''],
      start_date: ['', Validators.required], // ✅ added
      active_status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  /** ---------- LOAD COURSES ---------- */
  loadCourses(): void {
    this.isLoading = true;
    this.assignmentService.getCourses().subscribe({
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

  /** ---------- FILE SELECTION ---------- */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.assignmentForm.patchValue({
        assignment_file: this.selectedFile.name,
      });
    }
  }

  /** ---------- SUBMIT ---------- */
  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.markFormGroupTouched(this.assignmentForm);
      this.toastService.error('Validation', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    Object.keys(this.assignmentForm.value).forEach((key) => {
      if (key !== 'assignment_file') {
        const value = this.assignmentForm.value[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    if (this.selectedFile) {
      formData.append('assignment_file', this.selectedFile, this.selectedFile.name);
    }

    this.assignmentService.createAssignment(formData).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Assignment created!');
        this.router.navigate(['/admin/assignment/list']);
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
    this.router.navigate(['/admin/assignment/list']);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => control.markAsTouched());
  }

  get f() {
    return this.assignmentForm.controls;
  }
}
