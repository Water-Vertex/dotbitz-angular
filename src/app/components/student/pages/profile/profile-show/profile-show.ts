// // import { Component, OnInit } from '@angular/core';
// // import { StudentService } from '../../../../../services/student.service'; 
// // import { CommonModule } from '@angular/common';  
// // import { Router } from '@angular/router';  

// // @Component({
// //   selector: 'app-profile-show',
// //   standalone: true,   // agar standalone component hai
// //   imports: [CommonModule],
// //   templateUrl: './profile-show.html',
// // })
// // export class ProfileComponent implements OnInit {  
// //  user: any = null;
// //   loading = true;
// //   error = false;

// //  constructor(
// //     private studentService: StudentService,
// //     private router: Router 
// //   ) {}

// //  ngOnInit(): void {
// //   this.studentService.getProfile().subscribe({
// //     next: res => {
// //       this.user = res; 
// //       this.loading = false;
// //     },
// //     error: err => {
// //       console.error('Profile error:', err);
// //       this.loading = false;
// //     }
// //   });
// // }

// // editProfile(): void {
// //   this.router.navigate(['/student/profile/edit']);
// // }
// // }


// import { Component, OnInit } from '@angular/core';
// import { StudentService } from '../../../../../services/student.service';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-profile-show',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './profile-show.html',
// })
// export class ProfileComponent implements OnInit {  // ✅ FIXED: Changed to ProfileShowComponent
//   user: any = null;
//   loading = true;
//   error = false;

//   constructor(
//     private studentService: StudentService,
//     private router: Router 
//   ) {
//     console.log('🔷 ProfileComponent - Constructor called');
//   }

//   ngOnInit(): void {
//     console.log('🔷 ProfileComponent - ngOnInit called');
//     console.log('🔷 Calling getProfile()...');
    
//     this.studentService.getProfile().subscribe({
//       next: res => {
//         console.log('✅ Profile data received:', res);
//         this.user = res; 
//         this.loading = false;
//       },
//       error: err => {
//         console.error('❌ Profile error:', err);
//         console.error('❌ Error status:', err.status);
//         console.error('❌ Error response:', err.error);
//         this.error = true;
//         this.loading = false;
//       }
//     });
//   }

//   editProfile(): void {
//     console.log('📝 Navigating to edit profile');
//     this.router.navigate(['/student/profile/edit']);
//   }

//   getInitials(): string {
//     if (!this.user) return '??';
//     const first = this.user.first_name?.charAt(0)?.toUpperCase() || '';
//     const last = this.user.last_name?.charAt(0)?.toUpperCase() || '';
//     return first + last;
//   }
// }

import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../../../services/student.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-profile-show',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-show.html',
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = false;
  error = false;

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {
    console.log('🔷 ProfileComponent - Constructor called');
  }

  ngOnInit(): void {
  this.loading = true;
 
  this.studentService.getProfile().subscribe({
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
  // ngOnInit(): void {
  //   console.log('🔷 ProfileComponent - ngOnInit called');
  //   console.log('🔷 Calling getProfile()...');
  //   this.loading=true;
  //   this.studentService.getProfile().subscribe({
  //     next: res => {
  //       console.log('✅ Profile data received:', res);
        
  //       // ✅ Use setTimeout to force change detection
  //       setTimeout(() => {
  //         this.user = res; 
  //         this.loading = false;
          
  //         console.log('DEBUG: loading =', this.loading);
  //         console.log('DEBUG: user =', this.user);
  //         console.log('DEBUG: !loading && user =', !this.loading && this.user);
  //       }, 0);
  //     },
  //     error: err => {
  //       console.error('❌ Profile error:', err);
  //       console.error('❌ Error status:', err.status);
  //       console.error('❌ Error response:', err.error);
        
  //       setTimeout(() => {
  //         this.error = true;
  //         this.loading = false;
  //       }, 0);
  //     }
  //   });
  // }

  editProfile(): void {
    console.log('📝 Navigating to edit profile');
    this.router.navigate(['/student/profile/edit']);
  }

  getInitials(): string {
    if (!this.user) return '??';
    const first = this.user.first_name?.charAt(0)?.toUpperCase() || '';
    const last = this.user.last_name?.charAt(0)?.toUpperCase() || '';
    return first + last;
  }
}