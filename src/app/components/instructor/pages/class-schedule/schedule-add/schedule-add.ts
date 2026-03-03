// components/class-schedule/class-schedule-form/class-schedule-form.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course, Instructor } from '../../../../../models/classschedule.model';

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
  instructors: Instructor[] = [];

  statusOptions = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  constructor(
    private fb: FormBuilder,
    private scheduleService: ClassScheduleService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.scheduleForm = this.fb.group({
      course_id: ['', Validators.required],
      instructor_id: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      meeting_link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      duration: ['', [Validators.required, Validators.min(1)]],
      status: ['scheduled', Validators.required],
    });
  }

  ngOnInit(): void {
    this.scheduleId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.scheduleId;

    this.loadCourses();
    this.loadInstructors();

    if (this.isEditMode) {
      this.loadSchedule();
    } else {
      this.isLoading = false;
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

  loadInstructors(): void {
    this.scheduleService.getInstructors().subscribe({
      next: (res: any) => {
        this.instructors = Array.isArray(res.data) ? res.data : res || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load instructors');
      }
    });
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.scheduleService.getSchedule(this.scheduleId!).subscribe({
      next: (res: any) => {
        const schedule = res.data || res;
        this.scheduleForm.patchValue({
          course_id: schedule.course_id,
          instructor_id: schedule.instructor_id,
          start_time: this.formatDateForInput(schedule.start_time),
          end_time: this.formatDateForInput(schedule.end_time),
          meeting_link: schedule.meeting_link,
          duration: schedule.duration,
          status: schedule.status,
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to load schedule details');
        this.router.navigate(['/admin/class-schedule/list']);
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

    this.isSubmitting = true;

    const formData = { ...this.scheduleForm.value };

    if (this.isEditMode) {
      this.scheduleService.updateSchedule(this.scheduleId!, formData).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || 'Class schedule updated successfully');
          this.router.navigate(['/admin/class-schedule/list']);
        },
        error: (err: any) => {
          this.handleError(err);
        },
        complete: () => this.finishSubmission()
      });
    } else {
      this.scheduleService.createSchedule(formData).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || 'Class schedule created successfully');
          this.router.navigate(['/admin/class-schedule/list']);
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
    this.router.navigate(['/admin/class-schedule/list']);
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
