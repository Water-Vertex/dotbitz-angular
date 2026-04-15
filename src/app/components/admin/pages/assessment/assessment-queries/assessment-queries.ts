import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AssessmentQueryService } from '../../../../../services/assessmentquery.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-assessment-queries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './assessment-queries.html',
})
export class AssessmentQueries implements OnInit, OnDestroy {
  appointments: any[] = [];
  allAppointments: any[] = [];
  searchTerm: string = '';

  isLoading = false;
  isModalOpen = false;
  isFetchingAssessments = false;
  isSubmitting = false;

  assessmentTitles: any[] = [];
  selectedAssessment: any = null;
  selectedAppointment: any = null;

  assignForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AssessmentQueryService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e: any) => {
        if (e.url.includes('/admin/assessment/queries')) this.loadAppointments();
      });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.buildForm();
  }

  buildForm(): void {
    this.assignForm = this.fb.group({
      assessment_id: [null, Validators.required],
      time_to_complete: [{ value: '' }, [Validators.required, Validators.min(1)]], // ✅ disabled/readonly
      total_marks: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]], // ✅ disabled/readonly
      obtain_marks: [''],
      remarks: [''],
    });
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.appointmentService
      .getAssessmentQueries()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const data = res.data || res.assessment_queries || res || [];

          this.appointments = data.map((a: any) => ({
            ...a,
            name: a.full_name || a.user?.name || 'Unknown Student',
            isAssessmentAssigned: !!a.already_assigned,
          }));

          this.allAppointments = [...this.appointments];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Error', 'Failed to load appointments');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  checkAndOpenModal(appointment: any): void {
    if (appointment.isAssessmentAssigned) {
      this.toast.error('Warning', 'Assessment already assigned for this appointment');
      return;
    }
    this.openAssessmentModal(appointment);
  }

  openAssessmentModal(appointment: any): void {
    this.selectedAppointment = appointment;
    this.isModalOpen = true;
    this.isFetchingAssessments = true;
    this.assessmentTitles = [];
    this.selectedAssessment = null;

    // ✅ Reset form with disabled fields
    this.assignForm.patchValue({
      assessment_id: null,
      time_to_complete: '',
      total_marks: '',
      obtain_marks: '',
      remarks: '',
    });

    this.cdr.detectChanges();

    this.appointmentService
      .getAssessmentsForAppointment(appointment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assessmentTitles = data.map((a: any) => ({
            ...a,
            disabled: !!a.already_assigned,
          }));
          this.isFetchingAssessments = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Error', 'Could not fetch assessments');
          this.isFetchingAssessments = false;
          this.cdr.detectChanges();
        },
      });
  }

  onAssessmentSelect(event: any): void {
  const id = +event.target.value;
  this.selectedAssessment = this.assessmentTitles.find((a) => a.id === id) || null;

  if (this.selectedAssessment) {
    console.log('Selected Assessment:', this.selectedAssessment); // Debug: Check what data is coming

    // ✅ Update both fields
    this.assignForm.patchValue({
      assessment_id: id,
      total_marks: this.selectedAssessment.total_marks ?? this.selectedAssessment.totalMarks ?? '',

    });
  } else {
    this.assignForm.patchValue({
      assessment_id: null,
      total_marks: '',
      time_to_complete: '',
    });
  }
  this.cdr.detectChanges();
}

  submitAssign(): void {
    // ✅ Enable disabled fields temporarily to include their values in the submission
    this.assignForm.get('time_to_complete')?.enable();
    this.assignForm.get('total_marks')?.enable();

    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      this.toast.error('Validation', 'Please fill all required fields');
      // ✅ Re-disable fields
      
      this.assignForm.get('total_marks')?.disable();
      return;
    }

    this.isSubmitting = true;
    const payload = {
      appointment_id: this.selectedAppointment.id,
      ...this.assignForm.value,
    };

    this.appointmentService
      .assignAssessment(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.selectedAppointment.isAssessmentAssigned = true;
          const index = this.appointments.findIndex((a) => a.id === this.selectedAppointment.id);
          if (index !== -1) {
            this.appointments[index].isAssessmentAssigned = true;
            const allIndex = this.allAppointments.findIndex(
              (a) => a.id === this.selectedAppointment.id,
            );
            if (allIndex !== -1) this.allAppointments[allIndex].isAssessmentAssigned = true;
          }

          this.toast.success('Success', 'Assessment assigned successfully');
          this.closeAssessmentModal();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.toast.error('Error', err?.error?.message || 'Failed to assign');
          this.isSubmitting = false;
          // ✅ Re-disable fields on error
          this.assignForm.get('time_to_complete')?.disable();
          this.assignForm.get('total_marks')?.disable();
          this.cdr.detectChanges();
        },
      });
  }

  onSearch(): void {
    const s = this.searchTerm.trim().toLowerCase();
    this.appointments = !s
      ? [...this.allAppointments]
      : this.allAppointments.filter(
          (i) =>
            i.name?.toLowerCase().includes(s) ||
            i.email?.toLowerCase().includes(s) ||
            i.phone?.toLowerCase().includes(s) ||
            i.course?.course_name?.toLowerCase().includes(s),
        );
    this.cdr.detectChanges();
  }

  closeAssessmentModal(): void {
    this.isModalOpen = false;
    this.selectedAssessment = null;
    this.selectedAppointment = null;
    this.assessmentTitles = [];
    this.assignForm.reset();

    // ✅ Re-disable fields after reset
    this.assignForm.get('time_to_complete')?.disable();
    this.assignForm.get('total_marks')?.disable();

    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
