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
  isLoadingGeneral = false; // Admin login loader
  isLoadingGuardian = false; // Guardian login loader

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

  onSubmit(loginType: 'admin' | 'guardian'): void {
    if (this.loginForm.valid) {
      if (loginType === 'guardian') {
        this.isLoadingGuardian = true;
      } else {
        this.isLoadingGeneral = true;
      }

      const credentials = this.loginForm.value;
      const loginRequest =
        loginType === 'guardian'
          ? this.authService.guardianLogin(credentials)
          : this.authService.login(credentials);

      loginRequest.subscribe({
        next: (response: any) => {
          if (response.success) {
            this.toastService.success('Welcome!', 'Logged in successfully');
            this.router.navigate([
              loginType === 'guardian' ? '/guardian/dashboard' : '/admin/dashboard',
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
    this.isLoadingGeneral = false;
    this.isLoadingGuardian = false;
  }
}
