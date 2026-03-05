import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesByStudentService } from '../../../../../../services/coursesbystudent.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.html',
})
export class MyCourses implements OnInit {
  enrolledCourses: any[] = [];
  loading = true;

  constructor(
    private coursesByStudentService: CoursesByStudentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.loading = true;
    this.coursesByStudentService.getMyEnrolledCourses().subscribe({
      next: (res: any) => {
        this.enrolledCourses = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading enrolled courses:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEnrollmentStatusClass(status: string): string {
    switch (status) {
      case 'enrolled':  return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'dropped':   return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  }

  getCourseStatusClass(status: string): string {
    switch (status) {
      case 'active':   return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-gray-100 text-gray-500';
      default:         return 'bg-gray-100 text-gray-600';
    }
  }

}
