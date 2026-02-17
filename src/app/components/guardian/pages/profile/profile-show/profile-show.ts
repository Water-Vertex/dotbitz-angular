

import { Component, OnInit } from '@angular/core';
import { GuardianService } from '../../../../../services/guardian.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-profile-show',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-show.html',
})
export class ProfileShow implements OnInit {
  user: any = null;
  loading = false;
  error = false;

  constructor(
    private guardianService: GuardianService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    console.log('🔷 ProfileComponent - Constructor called');
  }

  ngOnInit(): void {
  this.loading = true;

  this.guardianService.getProfile().subscribe({
    next: (res) => {
      this.user = res;
      this.loading = false;
      this.cdr.detectChanges();   // 🔥 IMPORTANT
    },
    error: (err) => {
      this.error = true;
      this.loading = false;
      this.cdr.detectChanges();   // 🔥 IMPORTANT
    }
  });
}

  editProfile(): void {
    console.log('📝 Navigating to edit profile');
    this.router.navigate(['/guardian/profile/edit']);
  }

  getInitials(): string {
    if (!this.user) return '??';
    const first = this.user.first_name?.charAt(0)?.toUpperCase() || '';
    const last = this.user.last_name?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }
}
