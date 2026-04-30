import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../../../../../services/student.service'; // Path check kar lein

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.css',
})
export class StudentPasswordReset {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  showNewPassword = false;
  showConfirmPassword = false;

  errors: { newPassword?: string; confirmPassword?: string } = {};

  toast: { show: boolean; message: string; type: 'success' | 'error' } = {
    show: false,
    message: '',
    type: 'success',
  };

  strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  strengthTextColors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];

  // Constructor mein service inject karein
  constructor(private studentService: StudentService, private router: Router) {}

  get passwordStrength(): number {
    const p = this.newPassword;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  }

  get strengthLabel(): string {
    return ['Weak', 'Fair', 'Good', 'Strong'][this.passwordStrength - 1] ?? '';
  }

  validate(): boolean {
    this.errors = {};
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errors.newPassword = 'Password must be at least 6 characters.';
    }
    if (!this.confirmPassword) {
      this.errors.confirmPassword = 'Please confirm your password.';
    } else if (this.newPassword !== this.confirmPassword) {
      this.errors.confirmPassword = 'Passwords do not match.';
    }
    return Object.keys(this.errors).length === 0;
  }

  onResetPassword(): void {
    if (!this.validate()) return;

    this.loading = true;
    const payload = { 
      new_password: this.newPassword, 
      confirm_password: this.confirmPassword 
    };

   
    this.studentService.resetPassword(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Password reset successfully!', 'success');
        this.newPassword = '';
        this.confirmPassword = '';
        setTimeout(() => this.router.navigate(['/student/dashboard']), 2000);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Something went wrong. Please try again.';
        this.showToast(msg, 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => (this.toast.show = false), 3500);
  }

  goBack(): void {
    this.router.navigate(['/student/dashboard']);
  }
}