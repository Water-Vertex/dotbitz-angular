import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  loginForm: FormGroup;
  isLoadingAdmin = false;
  isLoadingStudent = false;



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
loginAsStudent() {
  if (this.loginForm.invalid) return;

  this.isLoadingStudent = true;


  this.authService.studentLogin(this.loginForm.value).subscribe({
    next: (res) => {
      this.isLoadingStudent = false;
      if (res.success) {
        this.toastService.success('Welcome!', 'Student logged in');
        this.router.navigate(['/student/dashboard']);
      }
    },
    error: (err) => {
      this.isLoadingStudent = false;
      this.toastService.error('Login Failed', err.error.message);
    }
  });
}


  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoadingAdmin = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Welcome!', 'Logged in successfully');
            this.router.navigate(['/admin/dashboard']);
          }
          this.isLoadingAdmin = false;
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.toastService.error('Login Failed', errorMessage);
          this.isLoadingAdmin = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
