import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-instructor-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './instructor-reset-password.html',
})
export class InstructorResetPassword implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  showPassword = false;
  token: string | null = null;
  email: string | null = null;
  isValidToken = false;
  isTokenValidating = true;
  
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordStrengthPercentage = 0;

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });

    this.resetPasswordForm.get('newPassword')?.valueChanges.subscribe((value) => {
      if (value) {
        this.updatePasswordStrength(value);
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      this.email = params['email'] || null;

      if (!this.token || !this.email) {
        this.toastService.error('Error', 'Invalid reset link. Please request a new one.');
        this.isTokenValidating = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/instructor/login']);
        }, 2000);
        return;
      }

      this.validateToken();
    });
  }

  validateToken(): void {
    if (!this.token || !this.email) {
      this.toastService.error('Error', 'Invalid reset link. Please request a new one.');
      this.isTokenValidating = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.router.navigate(['/instructor/login']);
      }, 2000);
      return;
    }

    this.isLoading = true;
    this.isTokenValidating = true;
    this.cdr.detectChanges();
    
    this.authService.validateInstructorResetToken({
      token: this.token,
      email: this.email
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.isValidToken = true;
          this.toastService.success('Valid', 'Please enter your new password.');
        } else {
          this.isValidToken = false;
          this.toastService.error('Error', response.message || 'Invalid or expired token.');
          setTimeout(() => {
            this.router.navigate(['/instructor/login']);
          }, 2000);
        }
        this.isLoading = false;
        this.isTokenValidating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Token validation error:', error);
        this.isValidToken = false;
        this.toastService.error('Error', 'Invalid or expired token. Please request a new link.');
        this.isLoading = false;
        this.isTokenValidating = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/instructor/login']);
        }, 2000);
      }
    });
  }

  onResetPassword(): void {
    if (this.resetPasswordForm.valid) {
      if (!this.token || !this.email) {
        this.toastService.error('Error', 'Invalid reset link. Please request a new one.');
        this.router.navigate(['/instructor/login']);
        return;
      }

      this.isLoading = true;
      this.cdr.detectChanges();

      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;

      this.authService.instructorResetPassword({
        email: this.email,
        password: newPassword,
        confirmPassword: confirmPassword,
        token: this.token
      }).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.toastService.success(
              'Success!', 
              response.message || 'Your password has been reset successfully.'
            );
            setTimeout(() => {
              this.router.navigate(['/instructor/login']);
            }, 2000);
          } else {
            this.toastService.error(
              'Failed', 
              response.message || 'Unable to reset password. Please try again.'
            );
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Reset password error:', error);
          
          let errorMessage = 'Failed to reset password. Please try again.';
          if (error.status === 401) {
            errorMessage = 'Unauthorized. Please request a new reset link.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid or expired reset token. Please request a new link.';
          } else if (error.status === 422) {
            errorMessage = 'Validation error: ' + (error.error?.errors ? JSON.stringify(error.error.errors) : 'Please check your inputs.');
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.toastService.error('Failed', errorMessage);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      Object.keys(this.resetPasswordForm.controls).forEach((key) =>
        this.resetPasswordForm.get(key)?.markAsTouched(),
      );
    }
  }

  private updatePasswordStrength(password: string): void {
    let score = 0;
    
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const maxScore = 7;
    this.passwordStrengthPercentage = Math.min((score / maxScore) * 100, 100);
    
    if (this.passwordStrengthPercentage < 40) {
      this.passwordStrength = 'weak';
    } else if (this.passwordStrengthPercentage < 70) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
    
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  navigateToInstructorLogin(): void {
    this.router.navigate(['/instructor/login']);
  }
}