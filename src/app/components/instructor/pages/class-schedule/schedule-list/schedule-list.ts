// components/class-schedule/class-schedule-list/class-schedule-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { ToastService } from '../../../../../services/toast.service';
import { ClassSchedule } from '../../../../../models/classschedule.model';

// Add these interfaces if not already defined in your models
interface Course {
  id: number;
  course_name?: string;
  name?: string;
  title?: string;
}

interface Instructor {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  email?: string;
}

@Component({
  selector: 'app-class-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './schedule-list.html',
})
export class ClassScheduleList implements OnInit {
  schedules: ClassSchedule[] = [];
  filteredSchedules: ClassSchedule[] = [];
  courses: Course[] = [];
  instructors: Instructor[] = [];
  courseMap: Map<number, string> = new Map();
  instructorMap: Map<number, string> = new Map();
  isLoading = true;
  searchTerm = '';
  statusFilter = '';

  // Status options for filter
  statusOptions = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  constructor(
    private scheduleService: ClassScheduleService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    // Load all data in parallel with error handling for each request
    forkJoin({
      schedules: this.scheduleService.getSchedules().pipe(
        catchError(error => {
          console.error('Error loading schedules:', error);
          return of({ data: [] });
        })
      ),
      courses: this.scheduleService.getCourses().pipe(
        catchError(error => {
          console.error('Error loading courses:', error);
          return of({ data: [] });
        })
      ),
      instructors: this.scheduleService.getInstructors().pipe(
        catchError(error => {
          console.error('Error loading instructors:', error);
          return of({ data: [] });
        })
      )
    }).subscribe({
      next: (results: any) => {
        console.log('API Results:', results); // Debug log

        // Process schedules with proper error handling
        try {
          if (results.schedules && results.schedules.data) {
            this.schedules = Array.isArray(results.schedules.data) ? results.schedules.data : [];
          } else if (Array.isArray(results.schedules)) {
            this.schedules = results.schedules;
          } else if (results.schedules && Array.isArray(results.schedules)) {
            this.schedules = results.schedules;
          } else {
            this.schedules = [];
          }
        } catch (e) {
          console.error('Error processing schedules:', e);
          this.schedules = [];
        }

        // Process courses
        try {
          if (results.courses && results.courses.data) {
            this.courses = Array.isArray(results.courses.data) ? results.courses.data : [];
          } else if (Array.isArray(results.courses)) {
            this.courses = results.courses;
          } else if (results.courses && Array.isArray(results.courses)) {
            this.courses = results.courses;
          } else {
            this.courses = [];
          }

          // Create course map for quick lookup
          this.courseMap.clear();
          this.courses.forEach((course: Course) => {
            const courseName = course.course_name || course.name || course.title || `Course #${course.id}`;
            this.courseMap.set(course.id, courseName);
          });
        } catch (e) {
          console.error('Error processing courses:', e);
          this.courses = [];
        }

        // Process instructors
        try {
          if (results.instructors && results.instructors.data) {
            this.instructors = Array.isArray(results.instructors.data) ? results.instructors.data : [];
          } else if (Array.isArray(results.instructors)) {
            this.instructors = results.instructors;
          } else if (results.instructors && Array.isArray(results.instructors)) {
            this.instructors = results.instructors;
          } else {
            this.instructors = [];
          }

          // Create instructor map for quick lookup
          this.instructorMap.clear();
          this.instructors.forEach((instructor: Instructor) => {
            let instructorName = '';

            if (instructor.full_name) {
              instructorName = instructor.full_name;
            } else if (instructor.name) {
              instructorName = instructor.name;
            } else if (instructor.first_name || instructor.last_name) {
              instructorName = `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim();
            } else {
              instructorName = `Instructor #${instructor.id}`;
            }

            this.instructorMap.set(instructor.id, instructorName);
          });
        } catch (e) {
          console.error('Error processing instructors:', e);
          this.instructors = [];
        }

        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ForkJoin Error:', error);
        this.toastService.error('Error', 'Failed to load some data. Please refresh the page.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSchedules(): void {
    this.scheduleService.getSchedules().pipe(
      catchError(error => {
        console.error('Error loading schedules:', error);
        return of({ data: [] });
      })
    ).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.schedules = Array.isArray(res.data) ? res.data : [];
        } else if (Array.isArray(res)) {
          this.schedules = res;
        } else {
          this.schedules = [];
        }
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to load class schedules');
      }
    });
  }

  applyFilter(): void {
    if (!this.schedules) {
      this.filteredSchedules = [];
      return;
    }

    let filtered = this.schedules;

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(schedule => {
        const courseName = this.getCourseName(schedule.course_id)?.toLowerCase() || '';
        const instructorName = this.getInstructorName(schedule.instructor_id)?.toLowerCase() || '';
        const meetingLink = schedule.meeting_link?.toLowerCase() || '';

        return courseName.includes(term) ||
               instructorName.includes(term) ||
               meetingLink.includes(term);
      });
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(schedule => schedule.status === this.statusFilter);
    }

    this.filteredSchedules = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.applyFilter();
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'scheduled': 'bg-yellow-100 text-yellow-800',
      'ongoing': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  }

  formatDay(day: string): string {
    if (!day) return 'N/A';
    // Capitalize first letter
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  getCourseName(courseId: number): string {
    if (!courseId) return 'N/A';

    // Try to get from map first (faster)
    if (this.courseMap.has(courseId)) {
      return this.courseMap.get(courseId) || `Course #${courseId}`;
    }

    // Fallback to array search
    if (!this.courses || this.courses.length === 0) return `Course #${courseId}`;
    const course = this.courses.find(c => c.id === courseId);

    if (course) {
      return course.course_name || course.name || course.title || `Course #${courseId}`;
    }

    return `Course #${courseId}`;
  }

  getInstructorName(instructorId: number): string {
    if (!instructorId) return 'N/A';

    // Try to get from map first (faster)
    if (this.instructorMap.has(instructorId)) {
      return this.instructorMap.get(instructorId) || `Instructor #${instructorId}`;
    }

    // Fallback to array search
    if (!this.instructors || this.instructors.length === 0) return `Instructor #${instructorId}`;
    const instructor = this.instructors.find(i => i.id === instructorId);

    if (instructor) {
      if (instructor.full_name) return instructor.full_name;
      if (instructor.name) return instructor.name;
      if (instructor.first_name || instructor.last_name) {
        return `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim();
      }
    }

    return `Instructor #${instructorId}`;
  }

  onEdit(id: number): void {
    this.router.navigate(['/instructor/class-schedule/edit', id]);
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this class schedule?')) {
      this.scheduleService.deleteSchedule(id).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || 'Class schedule deleted successfully');
          this.loadSchedules();
        },
        error: (err: any) => {
          this.toastService.error('Error', err.error?.message || 'Failed to delete schedule');
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/admin/class-schedule/view', id]);
  }

  // Helper method to check if data is loaded
  get hasData(): boolean {
    return this.schedules && this.schedules.length > 0;
  }

  // Helper method to get day display
  getDayDisplay(day: string): string {
    if (!day) return 'N/A';
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
}
