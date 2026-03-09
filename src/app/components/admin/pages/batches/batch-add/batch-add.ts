import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BatchService } from '../../../../../services/batch.service';
import { CourseService } from '../../../../../services/course.service';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-batch-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './batch-add.html',
  styleUrls: ['./batch-add.css']
})
export class BatchAdd implements OnInit {

  batchForm: FormGroup;
  isEditMode = false;
  batchId: number | null = null;
  isLoading = false;
  isSubmitting = false;

  instructors: any[] = [];
  courses: any[] = [];
  studentsList: any[] = [];

  isLoadingInstructors = false;
  isLoadingCourses = false;
  isLoadingStudents = false;

  constructor(
    private fb: FormBuilder,
    private batchService: BatchService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.batchForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      instructor_id: ['', Validators.required],
      course_id: ['', Validators.required],
      start_date: [''],
      end_date: [''],
      description: ['', Validators.maxLength(1000)],
      status: ['active', Validators.required],
      students: [[]] // ✅ array for multiselect
    });
  }

  ngOnInit(): void {

    this.loadInstructors(); // only load instructors initially

    // 👇 When instructor changes
    this.instructor_id?.valueChanges.subscribe((instructorId) => {
      this.courses = [];
      this.studentsList = [];
      this.batchForm.patchValue({ course_id: '', students: [] });

      if (instructorId) {
        this.loadCoursesByInstructor(instructorId);
      }
    });

    // 👇 When course changes
    this.course_id?.valueChanges.subscribe((courseId) => {
      this.studentsList = [];
      this.batchForm.patchValue({ students: [] });

      if (courseId) {
        this.loadStudentsByCourse(courseId);
      }
    });

    // Edit Mode
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.batchId = parseInt(id, 10);
        this.loadBatch(this.batchId);
      }
    });
  }

  /* ================================
        LOAD INSTRUCTORS
  ================================= */
  loadInstructors(): void {
    this.isLoadingInstructors = true;
    this.instructorService.getInstructors().subscribe({
      next: (res: any) => {
        this.instructors = res?.data || res || [];
        this.isLoadingInstructors = false;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load instructors');
        this.isLoadingInstructors = false;
      }
    });
  }

  /* ================================
        LOAD COURSES BY INSTRUCTOR
  ================================= */
  loadCoursesByInstructor(instructorId: number): void {
    this.isLoadingCourses = true;

    this.batchService.getCoursesByInstructor(instructorId).subscribe({
      next: (res: any) => {
        this.courses = res?.data || [];
        this.isLoadingCourses = false;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoadingCourses = false;
      }
    });
  }

  /* ================================
        LOAD STUDENTS BY COURSE
  ================================= */
  loadStudentsByCourse(courseId: number): void {
    this.isLoadingStudents = true;

    this.batchService.getStudentsByCourse(courseId).subscribe({
      next: (res: any) => {
        this.studentsList = res?.data || [];
        this.isLoadingStudents = false;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load students');
        this.isLoadingStudents = false;
      }
    });
  }

  /* ================================
        LOAD BATCH (EDIT MODE)
  ================================= */
  loadBatch(id: number): void {
    this.isLoading = true;

    this.batchService.getBatch(id).subscribe({
      next: (res: any) => {
        const batch = res?.data || res;

        if (!batch) return;

        this.batchForm.patchValue({
          name: batch.name,
          instructor_id: batch.instructor_id,
          course_id: batch.course_id,
          start_date: batch.start_date,
          end_date: batch.end_date,
          description: batch.description,
          status: batch.status || 'active',
          students: batch.students ? batch.students.split(',').map((s: string) => +s) : []
        });

        // Load dependent dropdowns in edit mode
        this.loadCoursesByInstructor(batch.instructor_id);
        this.loadStudentsByCourse(batch.course_id);

        this.isLoading = false;
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load batch');
        this.router.navigate(['/admin/batches/list']);
        this.isLoading = false;
      }
    });
  }

  /* ================================
        SUBMIT
  ================================= */
  onSubmit(): void {

    if (this.batchForm.invalid) {
      this.batchForm.markAllAsTouched();
      this.toastService.error('Validation Error', 'Please fill required fields.');
      return;
    }

    // Check if end date is before start date
    if (this.isEndDateBeforeStartDate()) {
      this.toastService.error('Validation Error', 'End date cannot be before start date.');
      return;
    }

    this.isSubmitting = true;

    const formData = this.batchForm.value;

    const request = this.isEditMode && this.batchId
      ? this.batchService.updateBatch(this.batchId, formData)
      : this.batchService.createBatch(formData);

    request.subscribe({
      next: () => {
        this.toastService.success('Success', this.isEditMode ? 'Batch updated!' : 'Batch created!');
        this.router.navigate(['/admin/batches/list']);
      },
      error: (err) => this.handleError(err),
      complete: () => this.isSubmitting = false
    });
  }

  /* ================================
        ERROR HANDLER
  ================================= */
  handleError(error: any): void {
    this.toastService.error('Error', error?.error?.message || 'Something went wrong');
    this.isSubmitting = false;
  }

  cancel(): void {
    this.router.navigate(['/admin/batches/list']);
  }

  /* ================================
        TOGGLE SELECT ALL STUDENTS
  ================================= */
  toggleSelectAllStudents(event: any): void {
    const checked = event.target.checked;
    const studentIds = checked ? this.studentsList.map(s => s.id) : [];
    this.batchForm.patchValue({ students: studentIds });
  }

  /* ================================
        GETTERS
  ================================= */
  get instructor_id() { return this.batchForm.get('instructor_id'); }
  get course_id() { return this.batchForm.get('course_id'); }
  get name() { return this.batchForm.get('name'); }
  get students() { return this.batchForm.get('students'); }
  get description() { return this.batchForm.get('description'); }
  get start_date() { return this.batchForm.get('start_date'); }
  get end_date() { return this.batchForm.get('end_date'); }

  /* ================================
        DATE VALIDATION
  ================================= */
  isEndDateBeforeStartDate(): boolean {
    const start = this.start_date?.value;
    const end = this.end_date?.value;

    if (!start || !end) return false;

    return new Date(end) < new Date(start);
  }

  /* ================================
        DISPLAY HELPERS
  ================================= */
  getCourseDisplayName(course: any): string {
    if (!course) return 'Unknown Course';
    return course.course_name || `Course #${course.id}`;
  }

  getInstructorDisplayName(instructor: any): string {
    if (!instructor) return 'Unknown Instructor';
    return instructor.name ||
           instructor.full_name ||
           `${instructor.first_name ?? ''} ${instructor.last_name ?? ''}`.trim() ||
           `Instructor #${instructor.id}`;
  }

  getStudentDisplayName(student: any): string {
    if (!student) return 'Unknown Student';

    return student.name ||

           `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim() ||
           student.email ||
           `Student #${student.id}`;
  }
}
