import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Yeh import hai
import { FormsModule } from '@angular/forms'; // Yeh bhi import hai
import { Router } from '@angular/router';
import { GuardianService } from '../../../../../../services/guardian.service';

@Component({
  selector: 'app-password-reset',
  standalone: true, 
  imports: [
    CommonModule, 
    FormsModule  
  ],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.css',
})
export class GuardianPasswordReset {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  showNewPassword = false;
  showConfirmPassword = false;
  errors: any = {};
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  strengthTextColors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];

  constructor(private guardianService: GuardianService, private router: Router) {}

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
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.passwordStrength - 1] || '';
  }

  goBack(): void {
    this.router.navigate(['/guardian/dashboard']);
  }

  onResetPassword(): void {
    this.errors = {}; // Reset errors before validation

    if (this.newPassword !== this.confirmPassword) {
      this.errors.confirmPassword = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errors.newPassword = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.guardianService.resetPassword({
      new_password: this.newPassword,
      confirm_password: this.confirmPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Password updated successfully!', 'success');
        setTimeout(() => this.router.navigate(['/guardian/dashboard']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Update failed', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => (this.toast.show = false), 3000);
  }
}