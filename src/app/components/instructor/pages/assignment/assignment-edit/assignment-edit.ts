import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../../../../services/assignment.service';

@Component({
  selector: 'app-instructor-assignment-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assignment-edit.html',
})
export class InstructorAssignmentEdit implements OnInit {

  assignmentId!: number;
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
    private route: ActivatedRoute,
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
    this.assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourses();
  }
goToList() {
  this.router.navigate(['/instructor/assignment/list']);
}
  loadCourses(): void {
    this.assignmentService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadAssignment();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load courses.');
      },
    });
  }

  loadAssignment(): void {
    this.assignmentService.getInstructorAssignment(this.assignmentId).subscribe({
      next: (res: any) => {
        const assignment = res.data || res;
        this.assignmentForm.patchValue({
          course_id:    assignment.course_id,
          batch_id:     assignment.batch_id,
          title:        assignment.title,
          description:  assignment.description,
          due_date:     assignment.due_date?.split('T')[0],
          total_marks:  assignment.total_marks,
          start_date:   assignment.start_date?.split('T')[0],
          active_status: assignment.active_status,
        });
        this.loadBatchesForCourse(assignment.course_id);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load assignment.');
        this.router.navigate(['/instructor/assignment/list']);
      },
    });
  }

  loadBatchesForCourse(courseId: number): void {
    this.loadingBatches = true;
    this.assignmentService.getInstructorBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });
  }

  onCourseChange(): void {
    this.assignmentForm.patchValue({ batch_id: '' });
    this.batches = [];
    const courseId = this.assignmentForm.value.course_id;
    if (!courseId) return;
    this.loadBatchesForCourse(courseId);
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
    formData.append('_method', 'PUT');
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

    this.assignmentService.updateInstructorAssignment(this.assignmentId, formData).subscribe({
      next: (res: any) => {
        alert('Assignment updated successfully!');
        this.router.navigate(['/instructor/assignment/list']);
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to update assignment.');
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
