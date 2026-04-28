// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../../../services/auth.service';
// import { User } from '../../../../models/user.model';

// @Component({
//   selector: 'app-layout',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './admin-layout.html',
// })
// export class AdminLayout {
//   currentUser: User | null = null;
//       userInitials: string = '';
//   constructor(private authService: AuthService, private router: Router) {}
// ngOnInit() {
//     // Subscribe to current user changes
//     this.authService.currentUser$.subscribe(user => {
//       this.currentUser = user;
//       this.setUserInitials();
//     });

//     // If you need to force load from storage (in case the subscription doesn't fire immediately)
//     if (!this.currentUser) {
//       this.currentUser = this.authService.getCurrentUser();
//       this.setUserInitials();
//     }
//   }
//   setUserInitials() {
//     if (this.currentUser?.first_name && this.currentUser?.last_name) {
//       const name = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
//       this.userInitials = name.charAt(0).toUpperCase();
//     } else if (this.currentUser?.email) {
//       this.userInitials = this.currentUser.email.charAt(0).toUpperCase();
//     } else {
//       this.userInitials = 'A'; // Default fallback
//     }
//   }
//   logout() {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/login']);
//     });
//   }

//   // Helper method to get full name
//   getFullName(): string {
//     if (this.currentUser?.first_name && this.currentUser?.last_name) {
//       return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
//     }
//     return 'Admin';
//   }
//   getUsername(): string {
//     if (this.currentUser?.first_name) {
//       return `${this.currentUser.first_name}`;
//     }
//     return 'Admin';
//   }

//   // Helper method to get email
//   getEmail(): string {
//     return this.currentUser?.email || 'admin@example.com';
//   }
//    navigateToLogout() {
//     this.router.navigate(['/admin/logout']);
//   }
// }



import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  currentUser: User | null = null;
  userInitials: string = '';
  
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setUserInitials();
    });

    // If you need to force load from storage (in case the subscription doesn't fire immediately)
    if (!this.currentUser) {
      this.currentUser = this.authService.getCurrentUser();
      this.setUserInitials();
    }
  }

  setUserInitials() {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      const name = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      this.userInitials = name.charAt(0).toUpperCase();
    } else if (this.currentUser?.email) {
      this.userInitials = this.currentUser.email.charAt(0).toUpperCase();
    } else {
      this.userInitials = 'A'; // Default fallback
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  // Helper method to get full name
  getFullName(): string {
    if (this.currentUser?.first_name && this.currentUser?.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
    }
    return 'Admin';
  }

  getUsername(): string {
    if (this.currentUser?.first_name) {
      return `${this.currentUser.first_name}`;
    }
    return 'Admin';
  }

  // Helper method to get email
  getEmail(): string {
    return this.currentUser?.email || 'admin@example.com';
  }

  navigateToLogout() {
    this.router.navigate(['/admin/logout']);
  }

  // ========== ✅ YEH METHODS ADD KARO (Permissions ke liye) ==========
  
  // Check permission
  can(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}