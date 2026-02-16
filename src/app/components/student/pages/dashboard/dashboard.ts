import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service'; // path adjust karo

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
})
export class StudentDashboardComponent implements OnInit {
  currentUser: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
  }
}
