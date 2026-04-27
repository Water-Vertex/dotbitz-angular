import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service'; 
import { User } from '../../../../models/user.model'; 

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './guest-layout.html',
  styleUrls: ['./guest-layout.css']
})
export class GuestLayout implements OnInit {
  currentUser: User | null = null;
  guestEmail: string | null = ''; // LocalStorage ya URL wala email
  userInitials: string = 'G';
  isSidebarActive: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 1. URL se email pakarna (Jese aapne reference code mein dikhaya)
    const emailFromUrl = this.route.snapshot.queryParamMap.get('email');

    if (emailFromUrl) {
      // Storage mein save karna taake refresh pe na jaye
      localStorage.setItem('guest_email', emailFromUrl);
      this.guestEmail = emailFromUrl;
    } else {
      // Agar URL mein nahi hai to Storage se uthayein
      this.guestEmail = localStorage.getItem('guest_email');
    }

    // Initials set karna
    this.setUserInitials();

    // 2. Auth status check (Optional)
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.email) {
        this.guestEmail = user.email;
      }
      this.setUserInitials();
    });
  }

  setUserInitials() {
    const email = this.guestEmail || this.currentUser?.email;
    if (this.currentUser?.first_name) {
      this.userInitials = this.currentUser.first_name.charAt(0).toUpperCase();
    } else if (email) {
      this.userInitials = email.charAt(0).toUpperCase();
    } else {
      this.userInitials = 'G';
    }
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  // Real Dynamic Email
  getEmail(): string {
    return this.guestEmail || this.currentUser?.email || 'Not Provided';
  }

  getUsername(): string {
    if (this.currentUser?.first_name) return this.currentUser.first_name;
    if (this.guestEmail) return this.guestEmail.split('@')[0];
    return 'Guest';
  }

  getFullName(): string {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return this.getUsername();
  }
}