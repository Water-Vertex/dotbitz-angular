import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-instructor-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './instructor-edit.html',
})
export class InstructorEdit implements OnInit, OnDestroy {

  instructorForm!: FormGroup;
  instructorId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  private routeSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && !isNaN(id)) {
        this.instructorId = +id;
        this.loadInstructor(this.instructorId);
      } else {
        this.toast.error('Error', 'Invalid Instructor ID');
        this.router.navigate(['/admin/instructor/list']);
      }
    });
  }

  initForm(): void {
    this.instructorForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: [''],
      status: ['active'],
      address: [''],
      city: [''],
      state: [''],
      zip_code: [''],
      work_experience: [''],
      salary: [''],
      // Education details
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      field_of_study: [''],
      start_date: ['', Validators.required],
      end_date: [''],
      is_current: [false],
      description: ['']
    });
  }

  loadInstructor(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // force UI update

    this.instructorService.getInstructor(id).subscribe({
      next: (res: any) => {

        let instructor = null;

        if (res?.data) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            instructor = res.data[0];
          } else if (typeof res.data === 'object') {
            instructor = res.data;
          }
        }

        if (!instructor) {
          this.toast.error('Error', 'Instructor not found or invalid data');
          this.router.navigate(['/admin/instructor/list']);
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        // Patch main instructor data
        this.instructorForm.patchValue({
          first_name: instructor.first_name ?? '',
          last_name: instructor.last_name ?? '',
          email: instructor.email ?? '',
          phone: instructor.phone ?? '',
          gender: instructor.gender ?? '',
          status: instructor.status ?? 'active',
          address: instructor.address ?? '',
          city: instructor.city ?? '',
          state: instructor.state ?? '',
          zip_code: instructor.zipcode ?? '',
          work_experience: instructor.work_experience ?? '',
          salary: instructor.salary ?? ''
        });

        // Patch education details if exist
        if (instructor.details && instructor.details.length > 0) {
          const d = instructor.details[0];
          this.instructorForm.patchValue({
            institution: d.institution ?? '',
            degree: d.degree ?? '',
            field_of_study: d.field_of_study ?? '',
            start_date: d.start_date ?? '',
            end_date: d.end_date ?? '',
            is_current: d.is_current ?? false,
            description: d.description ?? '',
          });
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('Error', 'Failed to load instructor');
        this.router.navigate(['/admin/instructor/list']);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.instructorForm.invalid) {
      this.toast.error('Validation Error', 'Please fill required fields');
      return;
    }

    if (!this.instructorId) {
      this.toast.error('Error', 'Invalid Instructor ID');
      return;
    }

    this.isSubmitting = true;
    const v = this.instructorForm.value;

    const payload = {
      first_name: v.first_name,
      last_name: v.last_name,
      email: v.email,
      phone: v.phone,
      gender: v.gender,
      status: v.status,
      address: v.address,
      city: v.city,
      state: v.state,
      zipcode: v.zip_code,
      work_experience: v.work_experience,
      salary: v.salary,
      details: [
        {
          institution: v.institution,
          degree: v.degree,
          field_of_study: v.field_of_study,
          start_date: v.start_date,
          end_date: v.end_date,
          is_current: v.is_current,
          description: v.description
        }
      ]
    };

    this.instructorService.updateInstructor(this.instructorId, payload).subscribe({
      next: (res: any) => {
        this.toast.success('Success', res.message || 'Instructor updated');
        this.router.navigate(['/admin/instructor/list']);
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Update failed');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/instructor/list']);
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}
