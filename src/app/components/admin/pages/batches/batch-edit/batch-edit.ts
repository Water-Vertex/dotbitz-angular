import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BatchService } from '../../../../../services/batch.service';
import { CourseService } from '../../../../../services/course.service';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-batch-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './batch-edit.html',
  styleUrls: ['./batch-edit.css']
})
export class BatchEdit implements OnInit, OnDestroy {

  batchForm: FormGroup;
  batchId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  isPageLoading = true;

  instructors: any[] = [];
  courses: any[] = [];
  studentsList: any[] = [];

  isLoadingInstructors = false;
  isLoadingCourses = false;
  isLoadingStudents = false;

  // Store original batch data for reference
  originalBatchData: any = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private batchService: BatchService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.batchForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      instructor_id: ['', Validators.required],
      course_id: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      description: ['', Validators.maxLength(1000)],
      status: ['active', Validators.required],
      students: [[]]
    });
  }

  ngOnInit(): void {
    console.log('BatchEdit initialized');

    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      const id = params['id'];
      if (id) {
        this.batchId = parseInt(id, 10);
        console.log('Batch ID set:', this.batchId);
        this.loadData();
      } else {
        console.log('No batch ID found');
        this.toastService.error('Error', 'Batch ID not found');
        this.router.navigate(['/admin/batches/list']);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData(): void {
    console.log('loadData called');
    this.isPageLoading = true;

    // Load instructors first
    this.loadInstructors();

    // Then load batch details
    if (this.batchId) {
      this.loadBatch();
    }
  }

  loadInstructors(): void {
    console.log('Loading instructors...');
    this.isLoadingInstructors = true;

    this.instructorService.getInstructors().subscribe({
      next: (res: any) => {
        console.log('Instructors loaded:', res);
        this.instructors = res?.data || res || [];
        this.isLoadingInstructors = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.toastService.error('Error', 'Failed to load instructors');
        this.isLoadingInstructors = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadBatch(): void {
    console.log('Loading batch with ID:', this.batchId);
    this.isLoading = true;

    this.batchService.getBatch(this.batchId!).subscribe({
      next: (res: any) => {
        console.log('Batch API Response:', res);
        const batch = res?.data || res;

        if (!batch) {
          console.log('Batch not found');
          this.toastService.error('Error', 'Batch not found');
          this.router.navigate(['/admin/batches/list']);
          return;
        }

        console.log('Batch data:', batch);
        this.originalBatchData = { ...batch };

        // Format dates for input (YYYY-MM-DD)
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        // Process students - ensure it's an array
        let studentIds: number[] = [];
        if (batch.students) {
          if (typeof batch.students === 'string') {
            // If it's a comma-separated string like "14,17" or just "14"
            studentIds = batch.students
              .split(',')
              .map((id: string) => {
                const trimmed = id.trim();
                return trimmed ? parseInt(trimmed, 10) : null;
              })
              .filter((id: number | null) => id !== null && !isNaN(id)) as number[];
          } else if (Array.isArray(batch.students)) {
            // If it's already an array
            studentIds = batch.students;
          } else if (typeof batch.students === 'number') {
            // If it's a single number
            studentIds = [batch.students];
          }
        }

        console.log('Processed student IDs:', studentIds);

        // Patch form values
        this.batchForm.patchValue({
          name: batch.name || '',
          instructor_id: batch.instructor_id || '',
          course_id: batch.course_id || '',
          start_date: formatDateForInput(batch.start_date),
          end_date: formatDateForInput(batch.end_date),
          description: batch.description || '',
          status: batch.status || 'active',
          students: studentIds
        });

        console.log('Form patched with values:', this.batchForm.value);

        // Load courses if instructor exists
        if (batch.instructor_id) {
          this.loadCoursesByInstructor(batch.instructor_id);
        }

        // Load students if course exists
        if (batch.course_id) {
          this.loadStudentsByCourse(batch.course_id);
        }

        this.isLoading = false;

        // Set isPageLoading to false after everything
        setTimeout(() => {
          this.isPageLoading = false;
          console.log('isPageLoading set to false');
          this.cdr.detectChanges();
        }, 500);
      },
      error: (error) => {
        console.error('Error loading batch:', error);
        this.toastService.error('Error', error?.error?.message || 'Failed to load batch');
        this.router.navigate(['/admin/batches/list']);
        this.isLoading = false;
        this.isPageLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCoursesByInstructor(instructorId: number): void {
    console.log('Loading courses for instructor:', instructorId);
    this.isLoadingCourses = true;

    this.batchService.getCoursesByInstructor(instructorId).subscribe({
      next: (res: any) => {
        console.log('Courses loaded:', res);
        this.courses = res?.data || [];
        this.isLoadingCourses = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoadingCourses = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadStudentsByCourse(courseId: number): void {
    console.log('Loading students for course:', courseId);
    this.isLoadingStudents = true;

    this.batchService.getStudentsByCourse(courseId).subscribe({
      next: (res: any) => {
        console.log('Students loaded:', res);
        this.studentsList = res?.data || [];

        // Restore selected students
        if (this.originalBatchData && this.studentsList.length > 0) {
          let originalStudentIds: number[] = [];

          if (typeof this.originalBatchData.students === 'string') {
            originalStudentIds = this.originalBatchData.students
              .split(',')
              .map((id: string) => {
                const trimmed = id.trim();
                return trimmed ? parseInt(trimmed, 10) : null;
              })
              .filter((id: number | null) => id !== null && !isNaN(id)) as number[];
          } else if (Array.isArray(this.originalBatchData.students)) {
            originalStudentIds = this.originalBatchData.students;
          } else if (typeof this.originalBatchData.students === 'number') {
            originalStudentIds = [this.originalBatchData.students];
          }

          console.log('Original student IDs:', originalStudentIds);
          console.log('Available students:', this.studentsList.map(s => s.id));

          const validStudentIds = originalStudentIds.filter(id =>
            this.studentsList.some(student => student.id === id)
          );

          console.log('Valid student IDs to restore:', validStudentIds);

          this.batchForm.patchValue({
            students: validStudentIds
          });

          console.log('Students restored, form value:', this.batchForm.get('students')?.value);
        }

        this.isLoadingStudents = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.toastService.error('Error', 'Failed to load students');
        this.isLoadingStudents = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      this.toastService.error('Validation Error', 'Please fill required fields.');
      return;
    }

    if (this.isEndDateBeforeStartDate()) {
      this.toastService.error('Validation Error', 'End date cannot be before start date.');
      return;
    }

    if (!this.batchId) {
      this.toastService.error('Error', 'Batch ID is missing');
      return;
    }

    this.isSubmitting = true;

    const formData = { ...this.batchForm.value };

    // FIX: Handle students properly - always convert to comma-separated string
    if (formData.students !== undefined && formData.students !== null) {
      // Ensure it's an array
      let studentsArray: number[] = [];

      if (Array.isArray(formData.students)) {
        studentsArray = formData.students;
      } else if (typeof formData.students === 'number') {
        studentsArray = [formData.students];
      } else if (typeof formData.students === 'string') {
        // If it's already a string, split it
        studentsArray = formData.students
          .split(',')
          .map((id: string) => parseInt(id.trim(), 10))
          .filter((id: number) => !isNaN(id));
      }

      // Filter out invalid values
      studentsArray = studentsArray.filter(id =>
        id !== null && id !== undefined && !isNaN(id)
      );

      // Convert to comma-separated string
      formData.students = studentsArray.length > 0 ? studentsArray.join(',') : '';
    } else {
      formData.students = '';
    }

    console.log('Submitting batch data:', formData);

    this.batchService.updateBatch(this.batchId, formData).subscribe({
      next: () => {
        this.toastService.success('Success', 'Batch updated successfully!');
        this.router.navigate(['/admin/batches/list']);
      },
      error: (err) => {
        console.error('Error updating batch:', err);
        this.toastService.error('Error', err?.error?.message || 'Something went wrong');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/batches/list']);
  }

  toggleSelectAllStudents(event: any): void {
    const checked = event.target.checked;
    const studentIds = checked ? this.studentsList.map(s => s.id) : [];
    this.batchForm.patchValue({ students: studentIds });
    console.log('Toggle all students:', studentIds);
  }

  isAllStudentsSelected(): boolean {
    const selected = this.students?.value || [];
    return selected.length === this.studentsList.length && this.studentsList.length > 0;
  }

  // Getters
  get instructor_id() { return this.batchForm.get('instructor_id'); }
  get course_id() { return this.batchForm.get('course_id'); }
  get name() { return this.batchForm.get('name'); }
  get students() { return this.batchForm.get('students'); }
  get description() { return this.batchForm.get('description'); }
  get start_date() { return this.batchForm.get('start_date'); }
  get end_date() { return this.batchForm.get('end_date'); }

  isEndDateBeforeStartDate(): boolean {
    const start = this.start_date?.value;
    const end = this.end_date?.value;
    if (!start || !end) return false;
    return new Date(end) < new Date(start);
  }

  getCourseDisplayName(course: any): string {
    if (!course) return 'Unknown Course';
    return course.course_name || course.name || course.title || `Course #${course.id}`;
  }

  getInstructorDisplayName(instructor: any): string {
    if (!instructor) return 'Unknown Instructor';
    return instructor.name ||
           instructor.full_name ||
           `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() ||
           instructor.email ||
           `Instructor #${instructor.id}`;
  }

  getStudentDisplayName(student: any): string {
    if (!student) return 'Unknown Student';
    return student.name ||
           student.full_name ||
           `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() ||
           student.email ||
           `Student #${student.id}`;
  }
}
