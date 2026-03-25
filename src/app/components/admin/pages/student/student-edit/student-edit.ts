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
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../../services/student.service';
import { RegistrationRequest } from '../../../../../models/student.model';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-edit.html',
  styleUrls: ['./student-edit.css'],
})
export class StudentEdit implements OnInit {
  registrationForm: FormGroup;
  currentStep = 1;
  showGuardianInfo = false;
  age: number | null = null;
  isLoading = false;
  apiError: string | null = null;
  studentId!: number;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
  ) {
    this.registrationForm = this.createForm();
  }

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.studentId) this.loadStudentData(this.studentId);

    this.registrationForm.get('dateOfBirth')?.valueChanges.subscribe(() => this.calculateAge());
    this.registrationForm.get('email')?.valueChanges.subscribe((email) => {
      if (email && this.registrationForm.get('email')?.valid) this.checkEmailAvailability(email);
    });
    this.registrationForm.get('userName')?.valueChanges.subscribe((username) => {
      if (username && this.registrationForm.get('userName')?.valid)
        this.checkUsernameAvailability(username);
    });
  }

  get f() {
    return this.registrationForm.controls;
  }
  get studentDetails() {
    return this.registrationForm.get('studentDetails') as FormArray;
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
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
        studentDetails: this.fb.array([]),
        guardianFirstName: ['', Validators.maxLength(100)],
        guardianLastName: ['', Validators.maxLength(100)],
        guardianEmail: ['', [Validators.email, Validators.maxLength(50)]],
        guardianPhone: ['', Validators.maxLength(20)],
        guardianRelationship: [''],
        password: ['', [Validators.minLength(6), Validators.maxLength(255)]],
        confirmPassword: [''],
        terms: [true],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  createStudentDetail(data?: any): FormGroup {
    return this.fb.group({
      institution: [data?.institution || '', [Validators.required, Validators.maxLength(255)]],
      degree: [data?.degree || '', [Validators.required, Validators.maxLength(255)]],
      fieldOfStudy: [data?.fieldOfStudy || '', Validators.maxLength(255)],
      startDate: [data?.startDate || '', Validators.required],
      endDate: [data?.endDate || ''],
      isCurrent: [data?.isCurrent || false],
      description: [data?.description || ''],
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
    if (!dob) return;
    const birth = new Date(dob);
    const today = new Date();
    this.age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) this.age--;
    this.showGuardianInfo = this.age < 18;
  }

  addStudentDetail(data?: any): void {
    this.studentDetails.push(this.createStudentDetail(data));
  }
  removeStudentDetail(index: number): void {
    this.studentDetails.removeAt(index);
  }

  onCurrentStudyChange(index: number): void {
    const detail = this.studentDetails.at(index);
    if (detail.get('isCurrent')?.value) {
      detail.get('endDate')?.disable();
      detail.get('endDate')?.setValue('');
    } else detail.get('endDate')?.enable();
  }

  previousStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }
  nextStep(): void {
    if (this.currentStep < 3) this.currentStep++;
  }

  // ←— Add isStepValid method here
  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return (
          !!this.registrationForm.get('firstName')?.valid &&
          !!this.registrationForm.get('lastName')?.valid &&
          !!this.registrationForm.get('userName')?.valid &&
          !!this.registrationForm.get('email')?.valid &&
          !!this.registrationForm.get('phone')?.valid &&
          !!this.registrationForm.get('dateOfBirth')?.valid &&
          !!this.registrationForm.get('gender')?.valid
        );
      case 2:
        return (
          this.studentDetails.length > 0 &&
          this.studentDetails.controls.every(
            (detail) =>
              !!detail.get('institution')?.valid &&
              !!detail.get('degree')?.valid &&
              !!detail.get('startDate')?.valid,
          )
        );
      case 3:
        if (this.showGuardianInfo) {
          return (
            !!this.registrationForm.get('guardianFirstName')?.valid &&
            !!this.registrationForm.get('guardianLastName')?.valid &&
            !!this.registrationForm.get('guardianEmail')?.valid &&
            !!this.registrationForm.get('guardianPhone')?.valid &&
            !!this.registrationForm.get('guardianRelationship')?.valid
          );
        } else {
          return (
            !!this.registrationForm.get('password')?.valid &&
            !!this.registrationForm.get('confirmPassword')?.valid &&
            !this.registrationForm.hasError('passwordMismatch') &&
            !!this.registrationForm.get('terms')?.value
          );
        }
      default:
        return false;
    }
  }

  // loadStudentData(id: number): void {
  //   this.isLoading = true;

  //   this.studentService.getStudentById(id).subscribe({
  //     next: (data) => {
  //       console.log('Loaded student:', data); // Debug: check returned data

  //       // Clear previous studentDetails
  //       this.studentDetails.clear();

  //       // Patch main student info
  //       const dob = data.date_of_birth ? new Date(data.date_of_birth).toISOString().substring(0, 10) : '';
  //       this.registrationForm.patchValue({
  //         firstName: data.first_name || '',
  //         lastName: data.last_name || '',
  //         userName: data.user_name || '',
  //         email: data.email || '',
  //         phone: data.phone || '',
  //         dateOfBirth: dob,
  //         gender: data.gender || '',
  //         address: data.address || '',
  //         city: data.city || '',
  //         state: data.state || '',
  //         zipcode: data.zipcode || '',
  //         guardianFirstName: data.guardian?.first_name || '',
  //         guardianLastName: data.guardian?.last_name || '',
  //         guardianEmail: data.guardian?.email || '',
  //         guardianPhone: data.guardian?.phone || '',
  //         guardianRelationship: data.guardian?.relationship || '',
  //         password: '',
  //         confirmPassword: '',
  //         terms: true
  //       });

  //       // Calculate age & show guardian info if needed
  //       this.calculateAge();

  //       // Add student education details
  //       if (data.student_details?.length) {
  //         data.student_details.forEach((edu: any) => this.addStudentDetail({
  //           institution: edu.institution || '',
  //           degree: edu.degree || '',
  //           fieldOfStudy: edu.field_of_study || '',
  //           startDate: edu.start_date ? new Date(edu.start_date).toISOString().substring(0,10) : '',
  //           endDate: edu.end_date ? new Date(edu.end_date).toISOString().substring(0,10) : '',
  //           isCurrent: edu.is_current || false,
  //           description: edu.description || ''
  //         }));
  //       }

  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error loading student:', err);
  //       this.apiError = err?.error?.message || err?.message || 'Failed to load student';
  //       this.isLoading = false;
  //     }
  //   });
  // }

  loadStudentData(id: number): void {
    this.isLoading = true;
    this.studentService.getStudentById(id).subscribe({
      next: (response) => {
        const data = response.data; // ← unwrap here

        this.studentDetails.clear();

        this.registrationForm.patchValue({
          firstName: data.first_name,
          lastName: data.last_name,
          userName: data.user_name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.date_of_birth ? data.date_of_birth.substring(0, 10) : '',
          gender: data.gender,
          address: data.address,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          guardianFirstName: data.guardian?.first_name,
          guardianLastName: data.guardian?.last_name,
          guardianEmail: data.guardian?.email,
          guardianPhone: data.guardian?.phone,
          guardianRelationship: data.guardian?.relationship,
        });

        this.calculateAge();

        if (data.student_details?.length) {
          data.student_details.forEach((edu: any) =>
            this.addStudentDetail({
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.field_of_study,
              startDate: edu.start_date ? edu.start_date.substring(0, 10) : '',
              endDate: edu.end_date ? edu.end_date.substring(0, 10) : '',
              isCurrent: edu.is_current,
              description: edu.description,
            }),
          );
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading student:', err);
        this.apiError = err?.error?.message || err?.message || 'Failed to load student';
        this.isLoading = false;
      },
    });
  }
  formatDateForInput(dateStr: string): string {
    const d = new Date(dateStr);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  checkEmailAvailability(email: string) {
    /* optional */
  }
  checkUsernameAvailability(username: string) {
    /* optional */
  }

  onSubmit(): void {
    if (this.registrationForm.invalid || this.isLoading) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = null;

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
        password: this.registrationForm.value.password || undefined,
      },
      student_details: this.registrationForm.value.studentDetails.map((d: any) => ({
        institution: d.institution,
        degree: d.degree,
        field_of_study: d.fieldOfStudy,
        start_date: d.startDate,
        end_date: d.isCurrent ? null : d.endDate,
        is_current: d.isCurrent,
        description: d.description,
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

    this.studentService.updateStudent(this.studentId, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Update Successful', 'Student details updated successfully');
        setTimeout(() => this.router.navigate(['/admin/student/list']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError = err?.error?.message || err?.message || 'Update failed';
        this.toastService.error('Update Failed', this.apiError || 'An unexpected error occurred');
      },
    });
  }
}
