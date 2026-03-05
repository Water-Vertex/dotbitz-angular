import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-login.html',
})
export class StudentLogin {
  loginForm: FormGroup;
<<<<<<< HEAD
  isLoading = false;
=======
  isLoading = false; // Admin login loader
>>>>>>> Muneeb

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
<<<<<<< HEAD
    if (!this.loginForm.valid) {
      Object.keys(this.loginForm.controls).forEach((key) =>
        this.loginForm.get(key)?.markAsTouched(),
      );
      return;
    }

    this.isLoading = true;

    this.authService.studentLogin(this.loginForm.value).subscribe({
      next: (response: any) => {
        if (response.success && response.token) {
          // ✅ Store token for future API calls
          localStorage.setItem('token', response.token);

          this.toastService.success('Welcome!', 'Logged in successfully');
          this.router.navigate(['/student/dashboard']);
        } else {
          this.toastService.error('Login Failed', response.message || 'Try again.');
        }
        this.resetLoaders();
      },
      error: (error) => {
        this.toastService.error('Login Failed', error.error?.message || 'Try again.');
        this.resetLoaders();
      },
    });
=======
    if (this.loginForm.valid) {
      this.isLoading = true;


           this.authService.studentLogin(this.loginForm.value).subscribe({
       next: (response: any) => {
          if (response.success) {
            this.toastService.success('Welcome!', 'Logged in successfully');
            this.router.navigate([
               '/student/dashboard',
            ]);
          } else {
            this.toastService.error('Login Failed', response.message || 'Try again.');
          }
          this.resetLoaders();
        },
        error: (error) => {
          this.toastService.error('Login Failed', error.error?.message || 'Try again.');
          this.resetLoaders();
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach((key) =>
        this.loginForm.get(key)?.markAsTouched(),
      );
    }
>>>>>>> Muneeb
  }

  private resetLoaders() {
    this.isLoading = false;
  }

  navigateToGuardianLogin() {
<<<<<<< HEAD
    this.router.navigate(['/guardian/login']);
  }
}
=======
  this.router.navigate(['/guardian/login']);
}
}
>>>>>>> Muneeb
