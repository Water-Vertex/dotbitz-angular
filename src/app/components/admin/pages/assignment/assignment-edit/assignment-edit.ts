import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AssignmentService } from '../../../../../services/assignment.service';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course, Assignment } from '../../../../../models/assignment.model';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-assignment-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './assignment-edit.html',
  styleUrls: ['./assignment-edit.css'],
})
export class AssignmentEdit implements OnInit {
  assignmentId!: number;
  assignmentForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: any[] = [];
  batches: any[] = [];
  loadingBatches = false;

  selectedFile: File | null = null;

  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
      '|', 'link', 'bulletedList', 'numberedList',
      '|', 'blockQuote', '|', 'undo', 'redo',
    ],
  };

  private routeSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.assignmentForm = this.fb.group({
      course_id: [null, Validators.required],
      batch_id:      ['', Validators.required],
      title: ['', Validators.required],
      description: [''], // CKEditor
      start_date: [''],
      due_date: ['', Validators.required],
      total_marks: [''],
      active_status: ['active', Validators.required], // default active
      assignment_file: [''], // optional, for display
    });
  }

  ngOnInit(): void {
    this.assignmentId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadCourses();

  }

  loadCourses(): void {
    this.assignmentService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : res || [];
        this.loadAssignment();
        this.cdr.detectChanges();
      },
     error: () => {
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoading = false;
      },
    });
  }

  loadAssignment(): void {
    this.assignmentService.getAssignment(this.assignmentId).subscribe({

      next: (res: any) => {
        const data: Assignment = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!data) {
          this.toastService.error('Error', 'Assignment not found');
          this.router.navigate(['/admin/assignment/list']);
          return;
        }

         const assignment = res.data || res;

        this.assignmentForm.patchValue({
          course_id:     assignment.course_id,
          batch_id:      assignment.batch_id,
          title:         assignment.title,
          description:   assignment.description || '',
          due_date:      assignment.due_date?.split('T')[0] || assignment.due_date,
          total_marks:   assignment.total_marks,
          start_date:    assignment.start_date?.split('T')[0] || assignment.start_date || '',
          status: assignment.status,
        });

         if (assignment.course_id) {
          this.loadBatchesForCourse(assignment.course_id);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load assignment');
        this.isLoading = false;
        this.router.navigate(['/admin/assignment/list']);
      },
    });
  }
  loadBatchesForCourse(courseId: number): void {
    this.loadingBatches = true;
    this.courseService.getBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = res || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.assignmentForm.patchValue({ assignment_file: this.selectedFile.name });
    }
  }
  onCourseChange(): void {
    this.assignmentForm.patchValue({ batch_id: '' });
    this.batches = [];
    const courseId = this.assignmentForm.value.course_id;
    if (!courseId) return;
    this.loadBatchesForCourse(courseId);
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid) {
      Object.values(this.assignmentForm.controls).forEach(c => c.markAsTouched());
      this.toastService.error('Validation', 'Please fill all required fields.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.keys(this.assignmentForm.value).forEach((key) => {
      if (key !== 'assignment_file') {
        const value = this.assignmentForm.value[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      }
    });

    if (this.selectedFile) {
       formData.append('assignment_file', this.selectedFile, this.selectedFile.name);
    }

    this.assignmentService.updateAssignment(this.assignmentId, formData).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Assignment updated!');
        this.router.navigate(['/admin/assignment/list']);
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || 'Failed to update';
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

  get f() { return this.assignmentForm.controls; }
}
