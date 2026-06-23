import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../../../../../services/assignment.service';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-instructor-assignment-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './assignment-edit.html',
  styleUrls: ['./assignment-edit.css'],
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

  // CKEditor configuration
  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
      '|', 'link', 'bulletedList', 'numberedList',
      '|', 'blockQuote', '|', 'undo', 'redo',
    ],
  };

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private courseService: CourseService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.assignmentForm = this.fb.group({
      course_id: ['', Validators.required],
      batch_id: ['', Validators.required],
      title: ['', Validators.required],
      description: [''], // CKEditor content
      start_date: [''],
      due_date: ['', Validators.required],
      total_marks: [''],
      active_status: ['active', Validators.required],
      assignment_file: [''], // optional, for display
    });
  }

  ngOnInit(): void {
    this.assignmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourses();
  }

  goToList(): void {
    this.router.navigate(['/instructor/assignment/list']);
  }

  loadCourses(): void {
    this.assignmentService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadAssignment();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadAssignment(): void {
    this.assignmentService.getInstructorAssignment(this.assignmentId).subscribe({
      next: (res: any) => {
        const assignment = res.data || res;

        if (!assignment) {
          this.toastService.error('Error', 'Assignment not found');
          this.router.navigate(['/instructor/assignment/list']);
          return;
        }

        // Format dates properly
        const startDate = assignment.start_date
          ? (assignment.start_date.split('T')[0] || assignment.start_date)
          : '';
        const dueDate = assignment.due_date
          ? (assignment.due_date.split('T')[0] || assignment.due_date)
          : '';

        this.assignmentForm.patchValue({
          course_id: assignment.course_id,
          batch_id: assignment.batch_id,
          title: assignment.title,
          description: assignment.description || '',
          start_date: startDate,
          due_date: dueDate,
          total_marks: assignment.total_marks,
          active_status: assignment.active_status || 'active',
        });

        // Load batches for the course
        if (assignment.course_id) {
          this.loadBatchesForCourse(assignment.course_id);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to load assignment');
        this.isLoading = false;
        this.router.navigate(['/instructor/assignment/list']);
        this.cdr.detectChanges();
      },
    });
  }

  loadBatchesForCourse(courseId: number): void {
    this.loadingBatches = true;
    this.cdr.detectChanges();

    this.assignmentService.getInstructorBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to load batches');
        this.loadingBatches = false;
        this.cdr.detectChanges();
      }
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
      this.toastService.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const formData = new FormData();
    formData.append('_method', 'PUT');

    // Append all form fields
    Object.keys(this.assignmentForm.value).forEach((key) => {
      if (key !== 'assignment_file') {
        const value = this.assignmentForm.value[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      }
    });

    // Append file if selected
    if (this.selectedFile) {
      formData.append('assignment_file', this.selectedFile, this.selectedFile.name);
    }

    this.assignmentService.updateInstructorAssignment(this.assignmentId, formData).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Assignment updated successfully!');
        this.router.navigate(['/instructor/assignment/list']);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to update assignment';
        this.toastService.error('Error', errorMsg);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/instructor/assignment/list']);
  }

  get f() {
    return this.assignmentForm.controls;
  }
}
