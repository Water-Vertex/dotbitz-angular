import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-instructor-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './instructor-add.html',
})
export class InstructorAdd implements OnInit {

  instructorForm!: FormGroup;
  isEditMode = false;
  instructorId: number | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.instructorId = +params['id'];
        this.loadInstructor(this.instructorId);
      }
    });
  }

  // Initialize form
  initForm(): void {
    this.instructorForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: [''],
      status: ['active'],
      address: [''],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      city: [''],
      state: [''],
      zip_code: [''],
      work_experience: [''],
      salary: [''],

      // Education fields (will be sent as details array)
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      field_of_study: [''],
      start_date: ['', Validators.required],
      end_date: [''],
      is_current: [false],
      description: ['']
    });
  }

  // Getters for form controls (template validation)
  get first_name() { return this.instructorForm.get('first_name'); }
  get last_name() { return this.instructorForm.get('last_name'); }
  get email() { return this.instructorForm.get('email'); }
  get phone() { return this.instructorForm.get('phone'); }
  get gender() { return this.instructorForm.get('gender'); }
  get status() { return this.instructorForm.get('status'); }
  get address() { return this.instructorForm.get('address'); }
  get password() { return this.instructorForm.get('password'); }
  get city() { return this.instructorForm.get('city'); }
  get state() { return this.instructorForm.get('state'); }
  get zip_code() { return this.instructorForm.get('zipcode'); }
  get work_experience() { return this.instructorForm.get('work_experience'); }
  get salary() { return this.instructorForm.get('salary'); }

  // Education getters

  get institution() { return this.instructorForm.get('institution'); }
  get degree() { return this.instructorForm.get('degree'); }
  get field_of_study() { return this.instructorForm.get('field_of_study'); }
  get start_date() { return this.instructorForm.get('start_date'); }
  get end_date() { return this.instructorForm.get('end_date'); }
  get is_current() { return this.instructorForm.get('is_current'); }
  get description() { return this.instructorForm.get('description'); }

  // Load instructor for edit
  loadInstructor(id: number): void {
    this.isLoading = true;
    this.instructorService.getInstructor(id).subscribe({
      next: (res: any) => {
        const instructorData = res.data;

        // Patch instructor fields
        this.instructorForm.patchValue({
          first_name: instructorData.first_name,
          last_name: instructorData.last_name,
          email: instructorData.email,
          phone: instructorData.phone,
          gender: instructorData.gender,
          status: instructorData.status,
          address: instructorData.address,
          city: instructorData.city,
          state: instructorData.state,
          zip_code: instructorData.zip_code,
          work_experience: instructorData.work_experience,
          salary: instructorData.salary
        });

        // Patch education details if exists
        if (instructorData.details && instructorData.details.length > 0) {
          const detail = instructorData.details[0];
          this.instructorForm.patchValue({
            institution: detail.institution,
            degree: detail.degree,
            field_of_study: detail.field_of_study,
            start_date: detail.start_date,
            end_date: detail.end_date,
            is_current: detail.is_current,
            description: detail.description
          });
        }

        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error', 'Failed to load instructor');
        this.router.navigate(['/admin/instructor/list']);
      }
    });
  }

  // Submit form
  onSubmit(): void {
    if (this.instructorForm.invalid) {
      this.toast.error('Validation Error', 'Please fill required fields');
      return;
    }

    this.isSubmitting = true;

    const formValue = this.instructorForm.value;

    // Prepare payload to match Laravel controller
    const payload: any = {
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      email: formValue.email,
      phone: formValue.phone,
      gender: formValue.gender,
      status: formValue.status,
      address: formValue.address,
      password: formValue.password, // send password only on create
      city: formValue.city,
      state: formValue.state,
      zipcode: formValue.zip_code,
      work_experience: formValue.work_experience,
      salary: formValue.salary,
      details: [
        {
          institution: formValue.institution,
          degree: formValue.degree,
          field_of_study: formValue.field_of_study,
          start_date: formValue.start_date,
          end_date: formValue.end_date,
          is_current: formValue.is_current,
          description: formValue.description
        }
      ]
    };

    if (this.isEditMode && this.instructorId) {
      // Remove password if empty during edit
      if (!payload.password) delete payload.password;

      this.instructorService.updateInstructor(this.instructorId, payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message || 'Instructor updated');
          this.router.navigate(['/admin/instructor/list']);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error', err.error?.message || 'Update failed');
        },
        complete: () => this.isSubmitting = false
      });
    } else {
      this.instructorService.createInstructor(payload).subscribe({
        next: (res) => {
          this.toast.success('Success', res.message || 'Instructor created');
          this.router.navigate(['/admin/instructor/list']);
        },
        error: (err) => {
          console.error(err);
          this.toast.error('Error', err.error?.message || 'Creation failed');
        },
        complete: () => this.isSubmitting = false
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/instructor/list']);
  }
}
