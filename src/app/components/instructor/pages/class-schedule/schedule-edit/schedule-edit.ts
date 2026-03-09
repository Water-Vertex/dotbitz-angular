// components/class-schedule/class-schedule-edit/class-schedule-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-class-schedule-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-edit.html', // You can create a separate template or reuse the existing one
})
export class ClassScheduleEdit implements OnInit {
  scheduleForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  scheduleId: number;

  courses: any[] = [];
  batches: any[] = [];
  instructorId: number | null = null;

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
  selectionMode: 'single' | 'multiple' | 'all' = 'single';

  constructor(
    private fb: FormBuilder,
    private scheduleService: ClassScheduleService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.scheduleId = this.route.snapshot.params['id'];
    
    this.scheduleForm = this.fb.group({
      course_id: ['', Validators.required],
      batch_id: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      meeting_link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      days: this.fb.array([]),
      status: ['scheduled', Validators.required],
      note: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    this.instructorId = this.authService.getCurrentUser()?.id || null;

    if (!this.instructorId) {
      this.toastService.error('Error', 'Instructor not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.scheduleId) {
      this.toastService.error('Error', 'No schedule ID provided');
      this.router.navigate(['/instructor/class-schedule/list']);
      return;
    }

    this.loadCourses();
    this.loadSchedule();
  }

  get daysArray() {
    return this.scheduleForm.get('days') as FormArray;
  }

  addDay(day: string = '') {
    const dayGroup = this.fb.group({
      day: [day, Validators.required]
    });
    this.daysArray.push(dayGroup);
  }

  removeDay(index: number) {
    this.daysArray.removeAt(index);
  }

  setSelectionMode(mode: 'single' | 'multiple' | 'all') {
    this.selectionMode = mode;
    this.daysArray.clear();

    if (mode === 'all') {
      this.daysOfWeek.forEach(day => {
        this.addDay(day.value);
      });
    } else {
      this.addDay('');
    }
  }

  loadCourses(): void {
    this.scheduleService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res.data) ? res.data : res || [];
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load courses');
      }
    });
  }

  onCourseChange(): void {
    const courseId = this.scheduleForm.get('course_id')?.value;
    if (courseId) {
      this.loadBatches(courseId);
    }
  }

  loadBatches(courseId: number): void {
    this.scheduleService.getBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = Array.isArray(res.data) ? res.data : res || [];
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load batches');
      }
    });
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.scheduleService.getSchedule(this.scheduleId).subscribe({
      next: (res: any) => {
        const schedule = res.data || res;

        if (!Array.isArray(schedule)) {
          // Single schedule
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

          // Load batches for the course
          this.loadBatches(schedule.course_id);
          
          // Set the day
          this.daysArray.at(0).patchValue({ day: schedule.day });
        } else if (schedule.length > 0) {
          // Multiple schedules (recurring)
          const firstSchedule = schedule[0];
          
          if (schedule.length === 7) {
            this.setSelectionMode('all');
          } else {
            this.setSelectionMode('multiple');
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

          // Load batches for the course
          this.loadBatches(firstSchedule.course_id);
        }

        this.isLoading = false;
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
    return date.toISOString().slice(0, 16);
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
    const schedules = [];
    const days = baseFormData.days.map((d: any) => d.day);

    for (const day of days) {
      schedules.push({
        course_id: baseFormData.course_id,
        instructor_id: this.instructorId,
        batch_id: baseFormData.batch_id,
        start_time: baseFormData.start_time,
        end_time: baseFormData.end_time,
        meeting_link: baseFormData.meeting_link,
        day: day,
        status: baseFormData.status,
        note: baseFormData.note
      });
    }

    this.scheduleService.updateSchedules(this.scheduleId, schedules).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Class schedules updated successfully');
        this.router.navigate(['/instructor/class-schedule/list']);
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || err.message || 'Failed to update schedules';
        this.toastService.error('Error', errorMsg);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/instructor/class-schedule/list']);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get f() {
    return this.scheduleForm.controls;
  }
}