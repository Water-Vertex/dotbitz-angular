import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssignmentService } from '../../../../../services/assignment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course, Assignment } from '../../../../../models/assignment.model';

@Component({
  selector: 'app-assignment-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assignment-edit.html',
})
export class AssignmentEdit implements OnInit, OnDestroy {
  assignmentForm: FormGroup;
  assignmentId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  courses: Course[] = [];

  existingFile: string | null = null; // Existing uploaded file
  selectedFile: File | null = null; // New file selected by user

  private routeSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.assignmentForm = this.fb.group({
      course_id: [null, Validators.required],
      title: ['', Validators.required],
      due_date: ['', Validators.required],
      total_marks: [''],
      assignment_file: [''], // optional, for display
    });
  }

  ngOnInit(): void {
    this.loadCourses();

    this.routeSub = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !isNaN(id)) {
        this.assignmentId = +id;
        this.loadAssignment(this.assignmentId);
      } else {
        this.toastService.error('Error', 'Invalid Assignment ID');
        this.router.navigate(['/admin/assignment/list']);
      }
    });
  }

  /** Load all courses */
  loadCourses(): void {
    this.assignmentService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : [res.data];
        this.cdr.detectChanges();
      },
      error: () => this.toastService.error('Error', 'Failed to load courses'),
    });
  }

  /** Load assignment details */
  loadAssignment(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignmentService.getAssignment(id).subscribe({
      next: (res: any) => {
        const data: Assignment = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!data) {
          this.toastService.error('Error', 'Assignment not found');
          this.router.navigate(['/admin/assignment/list']);
          return;
        }

        this.existingFile = data.assignment_file || null; // set existing file

        this.assignmentForm.patchValue({
          course_id: data.course_id,
          title: data.title,
          due_date: data.due_date,
          total_marks: data.total_marks,
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load assignment');
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
      this.assignmentForm.patchValue({
        assignment_file: this.selectedFile.name, // optional, for display
      });
    }
  }

  /** Submit updated assignment */
  onSubmit(): void {
    if (this.assignmentForm.invalid || !this.assignmentId) {
      this.markFormGroupTouched(this.assignmentForm);
      this.toastService.error('Validation', 'Please fill all required fields.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    const value = this.assignmentForm.value;

    formData.append('course_id', value.course_id);
    formData.append('title', value.title);
    formData.append('due_date', value.due_date);
    formData.append('total_marks', value.total_marks || '');

    // Append new file if selected
    if (this.selectedFile) {
      formData.append('assignment_file', this.selectedFile);
    }

    this.assignmentService.updateAssignment(this.assignmentId, formData).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Assignment updated successfully!');
        this.router.navigate(['/admin/assignment/list']);
      },
      error: (err: any) => {
        this.toastService.error('Error', err.message || 'Failed to update assignment');
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
    this.router.navigate(['/admin/assignment/list']);
  }

  /** Mark all controls touched */
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  /** Getter for form controls */
  get f() {
    return this.assignmentForm.controls;
  }
}
