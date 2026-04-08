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
import { AppointmentService } from '../../../../../services/appointment.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appointment-list.html',
})
export class AppointmentList implements OnInit, OnDestroy {
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
    private appointmentService: AppointmentService,
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
      time_to_complete: ['', [Validators.required, Validators.min(1)]],
      total_marks: ['', [Validators.required, Validators.min(1)]],
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
          // Data extraction
          const data = res.data || res.appointments || res || [];

          this.appointments = data.map((a: any) => ({
            ...a,
            // AGAR a.name khali hai, to a.user.name check karega
            name: a.name || a.user?.name || 'Unknown Student',
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
    this.assignForm.reset();
    this.cdr.detectChanges();

    this.appointmentService
      .getAssessmentsForAppointment(appointment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // API se milne wale array ko store karna
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

  // ✅ LOGIC UPDATED: Dropdown select hone par marks auto-fill honge
  // onAssessmentSelect(event: any): void {
  //   const id = +event.target.value;
  //   // Pura assessment object filter karke nikalen
  //   this.selectedAssessment = this.assessmentTitles.find((a) => a.id === id) || null;

  //   if (this.selectedAssessment) {
  //     // Form mein total_marks aur time auto-fill kar den
  //     this.assignForm.patchValue({
  //       assessment_id: id,
  //       total_marks: this.selectedAssessment.total_marks,
  //       time_to_complete: this.selectedAssessment.time_to_complete,
  //     });
  //   } else {
  //     this.assignForm.patchValue({ assessment_id: null, total_marks: '', time_to_complete: '' });
  //   }
  //   this.cdr.detectChanges();
  // }
  onAssessmentSelect(event: any): void {
    const id = +event.target.value;
    this.selectedAssessment = this.assessmentTitles.find((a) => a.id === id) || null;

    if (this.selectedAssessment) {
      this.assignForm.patchValue({
        assessment_id: id,
        total_marks: this.selectedAssessment.total_marks ?? '', // ✅ DB se aa raha hai
        time_to_complete: this.selectedAssessment.time_to_complete ?? '', // optional
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
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      this.toast.error('Validation', 'Please fill all required fields');
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
