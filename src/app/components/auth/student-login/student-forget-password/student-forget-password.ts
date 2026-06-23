import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-student-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-forget-password.html',
})
export class StudentForgotPassword {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  isEmailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();

      this.authService.studentForgotPassword(this.forgotPasswordForm.value).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.isEmailSent = true;
            this.toastService.success(
              'Email Sent!', 
              response.message || 'Password reset link has been sent to your email.'
            );
          } else {
            this.toastService.error(
              'Failed', 
              response.message || 'Unable to send reset link. Please try again.'
            );
          }
          this.resetLoaders();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Forgot password error:', error);
          
          let errorMessage = 'Failed to send reset link. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 404) {
            errorMessage = 'No account found with this email address.';
          } else if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
          }
          
          this.toastService.error('Failed', errorMessage);
          this.resetLoaders();
          this.cdr.detectChanges();
        },
      });
    } else {
      Object.keys(this.forgotPasswordForm.controls).forEach((key) =>
        this.forgotPasswordForm.get(key)?.markAsTouched(),
      );
      this.cdr.detectChanges();
    }
  }

  private resetLoaders(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  navigateToStudentLogin(): void {
    this.router.navigate(['/student/login']);
  }

  resendEmail(): void {
    this.isEmailSent = false;
    this.forgotPasswordForm.reset();
    this.cdr.detectChanges();
    this.toastService.info('Ready', 'Please enter your email to receive a new reset link.');
  }
}