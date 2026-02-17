import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { GuardianService } from '../../../../../services/guardian.service';

@Component({
  selector: 'app-prfile-edit',
  templateUrl: './profile-edit.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileEdit implements OnInit {
  editForm!: FormGroup;
  loading = false;
  saving = false;
  error = '';
  successMessage = '';
  user: any = null;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private guardianService: GuardianService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Initialize form with validators
   */
  initializeForm(): void {
    this.editForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      user_name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
      date_of_birth: [''],
      gender: [''],
      city: ['', [Validators.maxLength(255)]],
      state: ['', [Validators.maxLength(255)]],
    });
  }

  /**
   * Load current profile data
   */
  loadProfile(): void {
    this.loading = true;
    this.guardianService.getProfile().subscribe({
      next: (response) => {
        this.user = response;
        this.populateForm(response);
        this.loading = false;
        this.cdr.detectChanges();   // 🔥 IMPORTANT

      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile data';
        this.loading = false;
        this.cdr.detectChanges();   // 🔥 IMPORTANT


        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  /**
   * Populate form with existing data
   */
  populateForm(data: any): void {
    this.editForm.patchValue({
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      user_name: data.user_name || '',
      email: data.email || '',
      phone: data.phone || '',
      date_of_birth: data.date_of_birth || '',
      gender: data.gender || '',
      city: data.city || '',
      state: data.state || '',
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Clear previous messages
    this.error = '';
    this.successMessage = '';

    // Validate form
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      this.error = 'Please fill all required fields correctly';
      return;
    }

    this.saving = true;
    const formData = this.editForm.value;

    this.guardianService.updateProfile(formData).subscribe({
      next: (response) => {
        console.log('Profile updated:', response);
        this.successMessage = 'Profile updated successfully!';
        this.saving = false;

        // Redirect to profile view after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/student/profile']);
        }, 2000);
      },
      error: (err) => {
        console.error('Update error:', err);
        this.saving = false;

        // Handle validation errors
        if (err.status === 422 && err.error.errors) {
          const errors = err.error.errors;
          let errorMessage = 'Validation errors:\n';

          Object.keys(errors).forEach(key => {
            errorMessage += `- ${errors[key][0]}\n`;
          });

          this.error = errorMessage;
        } else {
          this.error = err.error.message || 'Failed to update profile. Please try again.';
        }
      }
    });
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Cancel and go back to profile
   */
  onCancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/student/profile']);
    }
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string = 'required'): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  /**
   * Get field error message
   */
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);

    if (!field || !field.touched || !field.errors) {
      return '';
    }

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }

    return '';
  }

  /**
   * Get user-friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      first_name: 'First Name',
      last_name: 'Last Name',
      user_name: 'Username',
      email: 'Email',
      phone: 'Phone',
      date_of_birth: 'Date of Birth',
      gender: 'Gender',
      city: 'City',
      state: 'State'
    };

    return labels[fieldName] || fieldName;
  }

  /**
   * Get initials for avatar
   */
  getInitials(): string {
    if (!this.user) return '??';
    const first = this.user.first_name?.charAt(0)?.toUpperCase() || '';
    const last = this.user.last_name?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }
}
