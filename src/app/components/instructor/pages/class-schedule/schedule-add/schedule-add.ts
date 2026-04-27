// components/class-schedule/class-schedule-form/class-schedule-form.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course , Batch} from '../../../../../models/classschedule.model';

@Component({
  selector: 'app-class-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './schedule-add.html',
})
export class ClassScheduleAdd implements OnInit {
  scheduleForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  isEditMode = false;
  scheduleId: number | null = null;

  courses: Course[] = [];
  batches: Batch[] = [];
  instructorId: number | null = null;
  instructorName: string | null = null;

  // Day options
  daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  statusOptions = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  // Selection modes
  selectionMode: 'single' | 'multiple' | 'all' = 'single';

  constructor(
    private fb: FormBuilder,
    private scheduleService: ClassScheduleService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.scheduleForm = this.fb.group({
      course_id: ['', Validators.required],
      batch_id: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      meeting_link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      days: this.fb.array([]), // FormArray for multiple days
      status: ['scheduled', Validators.required],
      note: ['', [Validators.maxLength(1000)]],
    });

    // Initialize with one day field
    this.addDay();
  }

  ngOnInit(): void {
    // Get logged in instructor ID from session
    this.instructorId = this.authService.getCurrentUser()?.id || null;
    this.instructorName = this.authService.getCurrentUser()?.first_name + ' ' + this.authService.getCurrentUser()?.last_name || null;

    if (!this.instructorId) {
      this.toastService.error('Error', 'Instructor not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.scheduleId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.scheduleId;

    this.loadCourses();

    if (this.isEditMode) {
      this.loadSchedule();
    } else {
      this.isLoading = false;
    }
  }

  // Get days FormArray
  get daysArray() {
    return this.scheduleForm.get('days') as FormArray;
  }

  // Add a new day field
  addDay(day: string = '') {
    const dayGroup = this.fb.group({
      day: [day, Validators.required]
    });
    this.daysArray.push(dayGroup);
  }

  // Remove a day field
  removeDay(index: number) {
    this.daysArray.removeAt(index);
  }

  // Set selection mode
  setSelectionMode(mode: 'single' | 'multiple' | 'all') {
    this.selectionMode = mode;
    this.daysArray.clear();

    if (mode === 'all') {
      // Add all days
      this.daysOfWeek.forEach(day => {
        this.addDay(day.value);
      });
    } else if (mode === 'single') {
      // Add one empty day
      this.addDay('');
    } else if (mode === 'multiple') {
      // Add one empty day (user can add more)
      this.addDay('');
    }
  }

  loadCourses(): void {
    this.scheduleService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : res || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load courses');
      }
    });
  }

  // Load batches when course is selected
  onCourseChange(): void {
    const courseId = this.scheduleForm.get('course_id')?.value;
    if (courseId) {
      this.loadBatches(courseId);
    } else {
      this.batches = [];
    }
  }

  loadBatches(courseId: number): void {
    this.scheduleService.getBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = Array.isArray(res.data) ? res.data : res || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load batches');
      }
    });
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.scheduleService.getSchedule(this.scheduleId!).subscribe({
      next: (res: any) => {
        const schedule = res.data || res;

        // If it's a single schedule (edit mode)
        if (!Array.isArray(schedule)) {
          this.setSelectionMode('single');
          this.scheduleForm.patchValue({
            course_id: schedule.course_id,
            batch_id: schedule.batch_id,
            start_time: this.formatDateForInput(schedule.start_time),
            end_time: this.formatDateForInput(schedule.end_time),
            meeting_link: schedule.meeting_link,
            status: schedule.status,
            note: schedule.note
          });

          // Set the day
          this.daysArray.at(0).patchValue({ day: schedule.day });
        }
        // If it's multiple schedules (for recurring)
        else if (schedule.length > 0) {
          const firstSchedule = schedule[0];

          if (schedule.length === 7) {
            this.setSelectionMode('all');
          } else {
            this.setSelectionMode('multiple');
            // Clear and add days
            this.daysArray.clear();
            schedule.forEach((s: any) => {
              this.addDay(s.day);
            });
          }

          this.scheduleForm.patchValue({
            course_id: firstSchedule.course_id,
            batch_id: firstSchedule.batch_id,
            start_time: this.formatDateForInput(firstSchedule.start_time),
            end_time: this.formatDateForInput(firstSchedule.end_time),
            meeting_link: firstSchedule.meeting_link,
            status: firstSchedule.status,
            note: firstSchedule.note
          });
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to load schedule details');
        this.router.navigate(['/instructor/class-schedule/list']);
      }
    });
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      this.markFormGroupTouched(this.scheduleForm);
      this.toastService.error('Validation', 'Please fill all required fields correctly.');
      return;
    }

    if (this.daysArray.length === 0) {
      this.toastService.error('Validation', 'Please select at least one day.');
      return;
    }

    this.isSubmitting = true;

    const baseFormData = { ...this.scheduleForm.value };

    // Prepare schedules for each selected day
    const schedules = [];
    const days = baseFormData.days.map((d: any) => d.day);

    for (const day of days) {
      schedules.push({
        course_id: baseFormData.course_id,
        instructor_id: this.instructorId, // Use logged in instructor
        batch_id: baseFormData.batch_id,
        start_time: baseFormData.start_time,
        end_time: baseFormData.end_time,
        meeting_link: baseFormData.meeting_link,
        day: day,
        status: baseFormData.status,
        note: baseFormData.note
      });
    }

    if (this.isEditMode) {
      // For edit mode, we need to update all schedules for this pattern
      this.scheduleService.updateSchedules(this.scheduleId!, schedules).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || 'Class schedules updated successfully');
          this.router.navigate(['/instructor/class-schedule/list']);
        },
        error: (err: any) => {
          this.handleError(err);
        },
        complete: () => this.finishSubmission()
      });
    } else {
      // Create multiple schedules
      this.scheduleService.createSchedules(schedules).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || `${schedules.length} class schedule(s) created successfully`);
          this.router.navigate(['/instructor/class-schedule/list']);
        },
        error: (err: any) => {
          this.handleError(err);
        },
        complete: () => this.finishSubmission()
      });
    }
  }

  private handleError(err: any): void {
    const errorMsg = err.error?.message || err.message || 'Operation failed';
    this.toastService.error('Error', errorMsg);
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  private finishSubmission(): void {
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }

  cancel(): void {
    this.router.navigate(['/instructor/class-schedule/list']);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  get f() {
    return this.scheduleForm.controls;
  }
}
