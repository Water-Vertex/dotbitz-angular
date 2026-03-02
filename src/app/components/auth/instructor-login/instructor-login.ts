import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-instructor-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './instructor-login.html',
})
export class InstructorLogin {
  loginForm: FormGroup;
  isLoading = false; // Admin login loader

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
    if (this.loginForm.valid) {
      this.isLoading = true;


           this.authService.InstructorLogin(this.loginForm.value).subscribe({
       next: (response: any) => {
          if (response.success) {
            this.toastService.success('Welcome!', 'Logged in successfully');
            this.router.navigate([
               '/instructor/dashboard',
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
  }

  private resetLoaders() {
    this.isLoading = false;
  }

  navigateToAdminLogin() {
  this.router.navigate(['/admin/login']);
}
}
