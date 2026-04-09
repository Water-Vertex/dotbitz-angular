import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancellation.html',
  styleUrls: ['./cancellation.css']
})
export class Cancellation {
  constructor(private router: Router) {}

  tryAgain(): void {
    const courseId = localStorage.getItem('pending_course_id');
    if (courseId) {
      this.router.navigate(['/student/checkout', courseId]);
      localStorage.removeItem('pending_course_id');
    } else {
      window.history.back();
    }
  }

  goToCourses(): void {
    this.router.navigate(['/student/courses/list']);
  }

  contactSupport(): void {
    this.router.navigate(['/student/support']);
  }
}