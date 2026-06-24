import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-login.html',
})
export class StudentLogin {
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
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.cdr.detectChanges();

      this.authService.studentLogin(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.toastService.success('Welcome!', 'Logged in successfully');
            this.router.navigate(['/student/dashboard']);
          } else {
            this.toastService.error('Login Failed', response.message || 'Try again.');
            this.router.navigate(['/student/login'], { replaceUrl: true });
          }
          this.resetLoaders();
        },
        error: (error) => {
          if (error.status === 401 || error.status === 403) {
            this.toastService.error('Login Failed', error.error?.message || 'Invalid credentials.');
            this.router.navigate(['/student/login'], { replaceUrl: true });
          } else {
            this.toastService.error('Login Failed', error.error?.message || 'Try again.');
          }
          this.resetLoaders();
        },
      });
    } else {
      Object.keys(this.loginForm.controls).forEach((key) =>
        this.loginForm.get(key)?.markAsTouched(),
      );
    }
  }

  private resetLoaders() {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.detectChanges();
  }

  navigateToGuardianLogin() {
    this.router.navigate(['/guardian/login']);
  }
}