import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../../../../../services/assignment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/assignment.model';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-assignment-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, QuillModule],
  templateUrl: './assignment-add.html',
})
export class AssignmentAdd implements OnInit {
  assignmentForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: Course[] = [];
  selectedFile: File | null = null;

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
      assignment_file: [''],
      start_date: ['', Validators.required],
      due_date: [''],
      total_marks: [''],
      description: [''],
      active_status: [true], // default true
    });
  }

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // basic formatting
      ['blockquote', 'code-block'], // blocks
      [{ header: 1 }, { header: 2 }], // headers
      [{ list: 'ordered' }, { list: 'bullet' }], // lists
      [{ script: 'sub' }, { script: 'super' }], // sub/superscript
      [{ indent: '-1' }, { indent: '+1' }], // indentation
      [{ direction: 'rtl' }], // text direction
      [{ size: ['small', false, 'large', 'huge'] }], // font size
      [{ color: [] }, { background: [] }], // color pickers
      [{ font: [] }], // font family
      [{ align: [] }], // alignment
      ['clean'], // remove formatting
      ['link', 'image', 'video'], // media
    ],
  };

  ngOnInit(): void {
    this.loadCourses();
  }

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.assignmentForm.patchValue({
        assignment_file: this.selectedFile.name,
      });
    }
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      this.markFormGroupTouched(this.assignmentForm);
      this.toastService.error('Validation', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    Object.keys(this.assignmentForm.value).forEach((key) => {
      let value = this.assignmentForm.value[key];

      if (key === 'active_status') {
        value = value ? '1' : '0';
      }

      if (key !== 'assignment_file' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Append file if selected
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
