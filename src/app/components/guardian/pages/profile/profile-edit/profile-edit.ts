import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GuardianService } from '../../../../../services/guardian.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-edit.html',
})
export class ProfileEdit implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private guardianService: GuardianService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize the form with specific validators
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
      gender: [''],
      address: ['', [Validators.maxLength(255)]],
      city: ['', [Validators.maxLength(255)]],
      state: ['', [Validators.maxLength(255)]],
      zipcode: ['', [Validators.maxLength(20)]],
      relationship: [''],
    });

    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.guardianService.getProfile().subscribe({
      next: (res) => {
        // Use patchValue with a small delay or ensure res matches form structure
        this.profileForm.patchValue(res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.error = 'Failed to load profile';
        this.loading = false;
      },
    });
  }

  saveProfile() {
    // DEBUG: This helps you see why the button might be "doing nothing"
    console.log('Attempting to save profile...');
    console.log('Form Value:', this.profileForm.value);

    if (this.profileForm.invalid) {
      console.error('Form is invalid. Check individual fields.');
      this.error = 'Please fill all required fields correctly.';

      // Highlight which field is causing the issue
      Object.keys(this.profileForm.controls).forEach((key) => {
        const controlErrors = this.profileForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log('Key control: ' + key + ', errors: ', controlErrors);
        }
      });
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.guardianService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.success = 'Profile updated successfully!';
        this.loading = false;
        // Optional: Redirect back to profile view after 2 seconds
        setTimeout(() => this.router.navigate(['/guardian/profile']), 2000);
      },
      error: (err) => {
        console.error('Backend Update Error:', err);
        this.error = err.error?.message || 'Failed to update profile. Please try again.';
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/guardian/profile']);
  }
}
