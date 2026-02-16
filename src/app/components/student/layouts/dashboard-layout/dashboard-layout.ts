// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../../../services/auth.service';
// import { Observable } from 'rxjs';
// import { User } from '../../../../models/user.model';

// @Component({
//   selector: 'app-dashboard-layout',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './dashboard-layout.html',
// })
// // export class DashboardLayoutComponent  {
// //   constructor(private authService: AuthService, private router: Router) {}
  
// export class DashboardLayoutComponent {
//   currentUser$!: Observable<User | null>;

//   constructor(private authService: AuthService, private router: Router) {
//     this.currentUser$ = this.authService.currentUser$; // bind current user observable
//   }
  

//   logout() {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/login']);
//     });
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.html',
})
// export class DashboardLayoutComponent implements OnInit {
//   currentUser: User | null = null;

//   constructor(private authService: AuthService, private router: Router) {}

//   ngOnInit() {
//     this.authService.currentUser$.subscribe(user => {
//       this.currentUser = user;
//     });
//   }

//   logout() {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/login']);
//     });
//   }
// }
export class DashboardLayoutComponent implements OnInit {

  currentUser: User | null = null;
  isUserMenuOpen = false;
isLoggingOut = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout() {

  this.isUserMenuOpen = false;
  this.isLoggingOut = true;

  setTimeout(() => {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }, 1000);
  }
}
