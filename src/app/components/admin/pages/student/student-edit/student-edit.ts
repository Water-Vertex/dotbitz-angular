import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StudentService } from '../../../../../services/student.service';
import { ToastService } from '../../../../../services/toast.service';
import { StudentDetail, Student } from '../../../../../models/student.model';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-edit.html',
  styleUrls: ['./student-edit.css']
})
export class StudentEdit implements OnInit, OnDestroy {
  registrationForm!: FormGroup;
  currentStep = 1;
  studentId?: number;
  age: number | null = null;
  showGuardianInfo = false;
  isLoading = false;

  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initForm();

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.studentId = Number(paramId);
      this.loadStudent();
    } else {
      this.addStudentDetail();
    }

    // Watch DOB changes for age calculation
    this.registrationForm.get('dateOfBirth')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(dob => this.calculateAge(dob));
  }

  initForm() {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      address: [''],
      city: [''],
      state: [''],
      zipcode: [''],
      password: ['', Validators.required],
      guardianFirstName: [''],
      guardianLastName: [''],
      guardianEmail: [''],
      guardianPhone: [''],
      guardianRelationship: [''],
      studentDetails: this.fb.array([])
    });
  }

  get studentDetails(): FormArray {
    return this.registrationForm.get('studentDetails') as FormArray;
  }

  loadStudent() {
    if (!this.studentId) return;
    this.isLoading = true;

    this.studentService.getStudentById(this.studentId).subscribe({
      next: (student: Student) => {
        if (!student) return;
        this.registrationForm.patchValue(student);
        if (student.date_of_birth) this.calculateAge(student.date_of_birth);

        this.studentService.getStudentDetails(this.studentId!).subscribe(details => {
          if (details?.length) {
            details.forEach(d => this.addStudentDetail(d));
          } else {
            this.addStudentDetail();
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.toast.error('Error', 'Failed to load student data');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateAge(dob?: string) {
    const date = dob ? new Date(dob) : new Date(this.registrationForm.get('dateOfBirth')?.value);
    if (date) {
      const diff = new Date().getTime() - date.getTime();
      this.age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      this.showGuardianInfo = this.age < 18;
      this.cdr.detectChanges();
    }
  }

  addStudentDetail(detail?: StudentDetail) {
    this.studentDetails.push(this.fb.group({
      institution: [detail?.institution || '', Validators.required],
      degree: [detail?.degree || '', Validators.required],
      fieldOfStudy: [detail?.field_of_study || ''],
      startDate: [detail?.start_date || '', Validators.required],
      endDate: [detail?.end_date || ''],
      isCurrent: [detail?.is_current || false],
      description: [detail?.description || '']
    }));
  }

  removeStudentDetail(index: number) {
    if (this.studentDetails.length > 1) this.studentDetails.removeAt(index);
  }

  onCurrentStudyChange(index: number) {
    const group = this.studentDetails.at(index);
    if (!group) return;
    if (group.get('isCurrent')?.value) {
      group.get('endDate')?.disable();
      group.get('endDate')?.setValue('');
    } else {
      group.get('endDate')?.enable();
    }
  }

  nextStep() { if (this.currentStep < 3) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    this.studentService.updateStudent(this.studentId!, this.registrationForm.value).subscribe({
      next: () => {
        this.toast.success('Success', 'Student updated successfully');
        this.router.navigate(['/students']);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to update student');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
