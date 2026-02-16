import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuardianService } from '../../../../../services/guardian.service';
import { catchError } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-view.html',
})
export class ProfileView implements OnInit {
  profile: any = null;
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private guardianService: GuardianService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile() {
    this.loading = true;
    this.error = null;

    this.guardianService
      .getProfile()
      .pipe(
        catchError((err) => {
          console.error('Error fetching profile:', err);
          this.error = 'Failed to load profile. Please try again later.';
          this.loading = false;
          this.cdr.detectChanges();
          return of(null); // Return null to continue the stream
        }),
      )
      .subscribe((res) => {
        if (res) {
          console.log('Profile:', res);
          this.profile = res;
        }
        this.loading = false;
      });
  }

  goToEdit() {
    this.router.navigate(['/guardian/profile/edit']);
  }
}
