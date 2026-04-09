// student-registration.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../../services/student.service';
import { RegistrationRequest } from '../../../../../models/student.model';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-add.html',
  styleUrls: ['./student-add.css'],
})
export class StudentAdd implements OnInit {
  registrationForm: FormGroup;
  currentStep = 1;
  showGuardianInfo = false;
  age: number | null = null;
  isLoading = false;
  apiError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private router: Router,
    private toastService: ToastService, // Inject toast service
  ) {
    this.registrationForm = this.createForm();
  }

  ngOnInit(): void {
    // Listen for email changes to check availability
    this.registrationForm.get('email')?.valueChanges.subscribe((email) => {
      if (email && this.registrationForm.get('email')?.valid) {
        this.checkEmailAvailability(email);
      }
    });

    // Listen for username changes to check availability
    this.registrationForm.get('userName')?.valueChanges.subscribe((username) => {
      if (username && this.registrationForm.get('userName')?.valid) {
        this.checkUsernameAvailability(username);
      }
    });
  }

  // Getter for easy access to form controls
  get f() {
    return this.registrationForm.controls;
  }

  get studentDetails() {
    return this.registrationForm.get('studentDetails') as FormArray;
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
        // Step 1: Personal Information
        firstName: ['', [Validators.required, Validators.maxLength(100)]],
        lastName: ['', [Validators.required, Validators.maxLength(100)]],
        userName: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
        phone: ['', [Validators.required, Validators.maxLength(20)]],
        dateOfBirth: ['', Validators.required],
        gender: ['', Validators.required],
        address: ['', Validators.maxLength(255)],
        city: ['', Validators.maxLength(255)],
        state: ['', Validators.maxLength(255)],
        zipcode: ['', Validators.maxLength(255)],

        // Step 2: Student Details (FormArray)
        studentDetails: this.fb.array([this.createStudentForm()]),

        // Step 3: Guardian & Security
        guardianFirstName: ['', Validators.maxLength(100)],
        guardianLastName: ['', Validators.maxLength(100)],
        guardianEmail: ['', [Validators.email, Validators.maxLength(50)]],
        guardianPhone: ['', Validators.maxLength(20)],
        guardianRelationship: [''],

        // Security
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(255)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  createStudentForm(): FormGroup {
    return this.fb.group({
      institution: ['', [Validators.required, Validators.maxLength(255)]],
      degree: ['', [Validators.required, Validators.maxLength(255)]],
      fieldOfStudy: ['', Validators.maxLength(255)],
      startDate: ['', Validators.required],
      endDate: [''],
      isCurrent: [false],
      description: [''],
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  calculateAge(): void {
    const dob = this.registrationForm.get('dateOfBirth')?.value;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      this.age = today.getFullYear() - birthDate.getFullYear();

      // Check if birthday has occurred this year
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        this.age--;
      }

      // Show guardian info if under 18
      this.showGuardianInfo = this.age < 18;

      // Set required validators for guardian if under 18
      const guardianControls = [
        'guardianFirstName',
        'guardianLastName',
        'guardianEmail',
        'guardianPhone',
        'guardianRelationship',
      ];

      guardianControls.forEach((controlName) => {
        const control = this.registrationForm.get(controlName);
        if (control) {
          if (this.showGuardianInfo) {
            control.setValidators([Validators.required]);
            if (controlName === 'guardianEmail') {
              control.setValidators([Validators.required, Validators.email]);
            }
          } else {
            control.clearValidators();
          }
          control.updateValueAndValidity();
        }
      });
    }
  }

  addStudentDetail(): void {
    this.studentDetails.push(this.createStudentForm());
  }

  removeStudentDetail(index: number): void {
    this.studentDetails.removeAt(index);
  }

  onCurrentStudyChange(index: number): void {
    const studentDetailGroup = this.studentDetails.at(index);
    const isCurrent = studentDetailGroup.get('isCurrent')?.value;

    if (isCurrent) {
      studentDetailGroup.get('endDate')?.disable();
      studentDetailGroup.get('endDate')?.setValue('');
    } else {
      studentDetailGroup.get('endDate')?.enable();
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        const step1Controls = [
          'firstName',
          'lastName',
          'userName',
          'email',
          'phone',
          'dateOfBirth',
          'gender',
        ];
        return step1Controls.every((control) => this.registrationForm.get(control)?.valid);

      case 2:
        return this.studentDetails.valid && this.studentDetails.controls.length > 0;

      case 3:
        if (this.showGuardianInfo) {
          const guardianControls = [
            'guardianFirstName',
            'guardianLastName',
            'guardianEmail',
            'guardianPhone',
            'guardianRelationship',
          ];
          const guardianValid = guardianControls.every(
            (control) => this.registrationForm.get(control)?.valid,
          );
          return (
            guardianValid &&
            this.registrationForm.get('password')?.valid &&
            this.registrationForm.get('confirmPassword')?.valid &&
            this.registrationForm.get('terms')?.value
          );
        } else {
          return (
            this.registrationForm.get('password')?.valid &&
            this.registrationForm.get('confirmPassword')?.valid &&
            this.registrationForm.get('terms')?.value
          );
        }

      default:
        return false;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep(): void {
    if (this.currentStep < 3 && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  checkEmailAvailability(email: string): void {
    this.studentService.checkEmailExists(email).subscribe({
      next: (response) => {
        if (response.exists) {
          this.registrationForm.get('email')?.setErrors({ emailExists: true });
        }
      },
      error: (error) => {
        console.error('Error checking email:', error);
      },
    });
  }

  checkUsernameAvailability(username: string): void {
    this.studentService.checkUsernameExists(username).subscribe({
      next: (response) => {
        if (response.exists) {
          this.registrationForm.get('userName')?.setErrors({ usernameExists: true });
        }
      },
      error: (error) => {
        console.error('Error checking username:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || this.isLoading) {
      // Mark all fields as touched to show validation errors
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = null;

    // Prepare data for API
    const formData: RegistrationRequest = {
      student: {
        first_name: this.registrationForm.value.firstName,
        last_name: this.registrationForm.value.lastName,
        user_name: this.registrationForm.value.userName,
        email: this.registrationForm.value.email,
        phone: this.registrationForm.value.phone,
        date_of_birth: this.registrationForm.value.dateOfBirth,
        gender: this.registrationForm.value.gender,
        address: this.registrationForm.value.address,
        state: this.registrationForm.value.state,
        city: this.registrationForm.value.city,
        zipcode: this.registrationForm.value.zipcode,
        password: this.registrationForm.value.password,
      },
      student_details: this.registrationForm.value.studentDetails.map((std_dt: any) => ({
        institution: std_dt.institution,
        degree: std_dt.degree,
        field_of_study: std_dt.fieldOfStudy,
        start_date: std_dt.startDate,
        end_date: std_dt.isCurrent ? null : std_dt.endDate,
        is_current: std_dt.isCurrent,
        description: std_dt.description,
      })),
      guardian: this.showGuardianInfo
        ? {
            first_name: this.registrationForm.value.guardianFirstName,
            last_name: this.registrationForm.value.guardianLastName,
            email: this.registrationForm.value.guardianEmail,
            phone: this.registrationForm.value.guardianPhone,
            relationship: this.registrationForm.value.guardianRelationship,
          }
        : undefined,
    };

    // Call API
    this.studentService.adminAddStudent(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Show success message and redirect
        // Show success toast
        this.toastService.success(
          'Registration Successful',
          'Your account has been created successfully! Please login with your credentials.',
        );
        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/admin/student/list']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.apiError = error.error?.message || 'Registration failed. Please try again.';
        this.toastService.error('Registration Failed', error.error?.message);

        console.error('Registration error:', error);
      },
    });
  }
}
