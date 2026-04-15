import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssignmentService } from '../../../../../services/assignment.service';

@Component({
  selector: 'app-instructor-assignment-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assignment-add.html',
})
export class InstructorAssignmentAdd implements OnInit {

  assignmentForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: any[] = [];
  batches: any[] = [];
  loadingBatches = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.assignmentForm = this.fb.group({
      course_id:    ['', Validators.required],
      batch_id:     ['', Validators.required],
      title:        ['', Validators.required],
      description:  [''],
      assignment_file: [''],
      due_date:     ['', Validators.required],
      total_marks:  [''],
      start_date:   [''],
      active_status: ['active', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }
goToList() {
  this.router.navigate(['/instructor/assignment/list']);
}
  loadCourses(): void {
    this.isLoading = true;
    this.assignmentService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load courses.');
      },
    });
  }

 onCourseChange(): void {
  this.assignmentForm.patchValue({ batch_id: '' });
  this.batches = [];

  const courseId = this.assignmentForm.value.course_id;
  console.log('Course ID:', courseId);

  if (!courseId) return;

  this.loadingBatches = true;

  this.assignmentService.getInstructorBatchesByCourse(courseId).subscribe({
    next: (res: any) => {
      console.log('Batches Response:', res);

      this.batches = res.data?.data || res.data || res || [];
      this.loadingBatches = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading batches:', err);
      this.loadingBatches = false;
    }
  });
}
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.assignmentForm.patchValue({ assignment_file: this.selectedFile.name });
    }
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      Object.values(this.assignmentForm.controls).forEach(c => c.markAsTouched());
      alert('Please fill all required fields.');
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

    this.assignmentService.createInstructorAssignment(formData).subscribe({
      next: (res: any) => {
        alert('Assignment created successfully!');
        this.router.navigate(['/instructor/assignment/list']);
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to create assignment.');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  get f() { return this.assignmentForm.controls; }
}
