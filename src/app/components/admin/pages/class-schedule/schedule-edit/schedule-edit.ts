import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-class-schedule-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-edit.html',
})
export class AdminClassScheduleEdit implements OnInit {
  scheduleForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  scheduleId: number;

  courses: any[] = [];
  batches: any[] = [];
  instructorId: number | null = null;
  instructorName: string | null = null;
  
  selectedDay: string = '';
  selectedDayLabel: string = '';

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

  constructor(
    private fb: FormBuilder,
    private scheduleService: ClassScheduleService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.scheduleId = Number(this.route.snapshot.params['id']);
    
    this.scheduleForm = this.fb.group({
      course_id: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      meeting_link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      status: ['scheduled', Validators.required],
      note: ['', [Validators.maxLength(1000)]],
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.instructorId = currentUser?.id || null;
    this.instructorName = currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : null;

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
  }

  loadCourses(): void {
    this.scheduleService.getCourses().subscribe({
      next: (res: any) => {
        console.log('Courses loaded:', res);
        this.courses = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.cdr.detectChanges();
        this.loadSchedule();
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.toastService.error('Error', 'Failed to load courses');
        this.cdr.detectChanges();
        this.loadSchedule();
      }
    });
  }

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
    console.log('Loading schedule with ID:', this.scheduleId);
    
    this.scheduleService.getSchedule(this.scheduleId).subscribe({
      next: (res: any) => {
        console.log('Schedule loaded:', res);
        
        const schedule = res.data || res;

        if (!schedule) {
          this.toastService.error('Error', 'No schedule data found');
          this.router.navigate(['/instructor/class-schedule/list']);
          return;
        }

        this.initializeFormWithSchedule(schedule);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading schedule:', err);
        this.toastService.error('Error', err.error?.message || err.message || 'Failed to load schedule details');
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/instructor/class-schedule/list']);
      }
    });
  }

  private initializeFormWithSchedule(schedule: any): void {
    // Handle single schedule (not array)
    const scheduleData = Array.isArray(schedule) ? schedule[0] : schedule;
    
    if (!scheduleData) {
      this.toastService.error('Error', 'No schedule data found');
      this.router.navigate(['/instructor/class-schedule/list']);
      return;
    }

    // Set the day value and label
    this.selectedDay = scheduleData.day || '';
    this.selectedDayLabel = this.getDayLabel(this.selectedDay);

    // Patch form values
    this.scheduleForm.patchValue({
      course_id: scheduleData.course_id,
      batch_id: scheduleData.batch_id,
      start_time: this.formatDateForInput(scheduleData.start_time),
      end_time: this.formatDateForInput(scheduleData.end_time),
      meeting_link: scheduleData.meeting_link,
      status: scheduleData.status,
      note: scheduleData.note || ''
    });

    // Load batches for the course
    if (scheduleData.course_id) {
      
    }
  }

  getDayLabel(dayValue: string): string {
    if (!dayValue) return '';
    const day = this.daysOfWeek.find(d => d.value.toLowerCase() === dayValue.toLowerCase());
    return day ? day.label : dayValue;
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      this.markFormGroupTouched(this.scheduleForm);
      
      const errors = [];
      if (this.scheduleForm.get('course_id')?.invalid) errors.push('Course');
      if (this.scheduleForm.get('batch_id')?.invalid) errors.push('Batch');
      if (this.scheduleForm.get('start_time')?.invalid) errors.push('Start time');
      if (this.scheduleForm.get('end_time')?.invalid) errors.push('End time');
      if (this.scheduleForm.get('meeting_link')?.invalid) errors.push('Meeting link');
      
      const errorMsg = errors.length > 0 
        ? `Please fill required fields: ${errors.join(', ')}`
        : 'Please fill all required fields correctly.';
      
      this.toastService.error('Validation', errorMsg);
      return;
    }

    if (!this.selectedDay) {
      this.toastService.error('Validation', 'Day information is missing.');
      return;
    }

    this.isSubmitting = true;
    this.cdr.detectChanges();

    const formData = this.scheduleForm.value;

    const scheduleData = {
      course_id: formData.course_id,
      instructor_id: this.instructorId,
      batch_id: formData.batch_id,
      start_time: formData.start_time,
      end_time: formData.end_time,
      meeting_link: formData.meeting_link,
      day: this.selectedDay,
      status: formData.status,
      note: formData.note
    };

    console.log('Updating schedule:', scheduleData);

    // If your API expects an array for updates
    this.scheduleService.updateSchedules(this.scheduleId, [scheduleData]).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res.message || 'Class schedule updated successfully');
        this.cdr.detectChanges();
        this.router.navigate(['/instructor/class-schedule/list']);
      },
      error: (err: any) => {
        console.error('Error updating schedule:', err);
        const errorMsg = err.error?.message || err.message || 'Failed to update schedule';
        this.toastService.error('Error', errorMsg);
        this.isSubmitting = false;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  get f() {
    return this.scheduleForm.controls;
  }
}