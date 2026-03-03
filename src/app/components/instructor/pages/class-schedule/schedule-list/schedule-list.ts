// components/class-schedule/class-schedule-list/class-schedule-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { ToastService } from '../../../../../services/toast.service';
import { ClassSchedule } from '../../../../../models/classschedule.model';

// Add these interfaces if not already defined in your models
interface Course {
  id: number;
  course_name?: string;
  title?: string;
}

interface Instructor {
  id: number;
  first_name?: string;
  last_name?: string;
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
  courses: Course[] = []; // Added this
  instructors: Instructor[] = []; // Added this
  courseMap: Map<number, string> = new Map(); // Optional: for better performance
  instructorMap: Map<number, string> = new Map(); // Optional: for better performance
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

    // Load all data in parallel
    forkJoin({
      schedules: this.scheduleService.getSchedules(),
      courses: this.scheduleService.getCourses(), // Make sure this method exists in your service
      instructors: this.scheduleService.getInstructors() // Make sure this method exists in your service
    }).subscribe({
      next: (results: any) => {
        // Process schedules
        this.schedules = Array.isArray(results.schedules.data) ? results.schedules.data : results.schedules || [];

        // Process courses
        const coursesData = Array.isArray(results.courses.data) ? results.courses.data : results.courses || [];
        this.courses = coursesData;

        // Create course map for quick lookup
        this.courseMap.clear();
        coursesData.forEach((course: Course) => {
          const courseName = course.course_name || course.title || `Course #${course.id}`;
          this.courseMap.set(course.id, courseName);
        });

        // Process instructors
        const instructorsData = Array.isArray(results.instructors.data) ? results.instructors.data : results.instructors || [];
        this.instructors = instructorsData;

        // Create instructor map for quick lookup
        this.instructorMap.clear();
        instructorsData.forEach((instructor: Instructor) => {
          const instructorName = instructor.first_name + (instructor.last_name ? ` ${instructor.last_name}` : '') || `Instructor #${instructor.id}`;
          this.instructorMap.set(instructor.id, instructorName);
        });

        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to load data');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSchedules(): void {
    // This method is now part of loadInitialData
    // You can keep it for reloading after delete
    this.scheduleService.getSchedules().subscribe({
      next: (res: any) => {
        this.schedules = Array.isArray(res.data) ? res.data : res || [];
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.error('Error', 'Failed to load class schedules');
      }
    });
  }

  applyFilter(): void {
    let filtered = this.schedules;

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(schedule =>
        this.getCourseName(schedule.course_id)?.toLowerCase().includes(term) ||
        this.getInstructorName(schedule.instructor_id)?.toLowerCase().includes(term) ||
        schedule.meeting_link?.toLowerCase().includes(term)
      );
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
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getCourseName(courseId: number): string {
    // Try to get from map first (faster)
    if (this.courseMap.has(courseId)) {
      return this.courseMap.get(courseId) || `Course #${courseId}`;
    }

    // Fallback to array search
    if (!this.courses || this.courses.length === 0) return `Course #${courseId}`;
    const course = this.courses.find(c => c.id === courseId);
    return course ? (course.course_name || course.title || `Course #${courseId}`) : `Course #${courseId}`;
  }

  getInstructorName(instructorId: number): string {
    // Try to get from map first (faster)
    if (this.instructorMap.has(instructorId)) {
      return this.instructorMap.get(instructorId) || `Instructor #${instructorId}`;
    }

    // Fallback to array search
    if (!this.instructors || this.instructors.length === 0) return `Instructor #${instructorId}`;
    const instructor = this.instructors.find(i => i.id === instructorId);
    return instructor ? (instructor.first_name + (instructor.last_name ? ` ${instructor.last_name}` : '') || `Instructor #${instructorId}`) : `Instructor #${instructorId}`;
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/class-schedule/edit', id]);
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this class schedule?')) {
      this.scheduleService.deleteSchedule(id).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || 'Class schedule deleted successfully');
          // Reload just the schedules, courses and instructors remain the same
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
}
