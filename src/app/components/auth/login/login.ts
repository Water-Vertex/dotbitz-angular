import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.toastService.success('Welcome!', 'Logged in successfully');
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.toastService.error('Login Failed', response.message || 'Try again.');
            this.router.navigate(['/admin/login'], { replaceUrl: true });
          }
          this.resetLoaders();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Login error:', error);
          
          let errorMessage = 'Login failed. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
          } else if (error.status === 401) {
            errorMessage = 'Invalid email or password.';
          } else if (error.status === 403) {
            errorMessage = 'Account not activated. Please contact support.';
          }
          
          this.toastService.error('Login Failed', errorMessage);
          this.router.navigate(['/admin/login'], { replaceUrl: true });
          this.resetLoaders();
          this.cdr.detectChanges();
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.cdr.detectChanges();
    }
  }

  private resetLoaders(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  navigateToInstructorLogin() {
    this.router.navigate(['/instructor/login']);
  }
}