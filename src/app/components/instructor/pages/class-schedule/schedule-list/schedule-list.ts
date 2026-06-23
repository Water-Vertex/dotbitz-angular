import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { ToastService } from '../../../../../services/toast.service';
import { ClassSchedule } from '../../../../../models/classschedule.model';
import { GoogleCalendarService } from '../../../../../services/google-calendar.service';

interface Course {
  id: number;
  course_name?: string;
  course_code?: string;
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
  styleUrls: ['./schedule-list.css']
})
export class ClassScheduleList implements OnInit {
  schedules: ClassSchedule[] = [];
  filteredSchedules: ClassSchedule[] = [];
  courses: Course[] = [];
  instructors: Instructor[] = [];
  courseMap: Map<number, string> = new Map();
  courseCodeMap: Map<number, string> = new Map();
  instructorMap: Map<number, string> = new Map();
  isLoading = true;
  searchTerm = '';
  statusFilter = '';

  // Status options for filter
  statusOptions = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  // Accordion state
  expandedSchedule: number | null = null;

  constructor(
    private scheduleService: ClassScheduleService,
    private toastService: ToastService,
    private router: Router,
    private googleCalendar: GoogleCalendarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

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
        console.log('API Results:', results);

        // Process schedules
        try {
          if (results.schedules && results.schedules.data) {
            this.schedules = Array.isArray(results.schedules.data) ? results.schedules.data : [];
          } else if (Array.isArray(results.schedules)) {
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
          } else {
            this.courses = [];
          }

          this.courseMap.clear();
          this.courseCodeMap.clear();
          this.courses.forEach((course: Course) => {
            const courseName = course.course_name || course.name || course.title || `Course #${course.id}`;
            const courseCode = course.course_code || '';
            this.courseMap.set(course.id, courseName);
            this.courseCodeMap.set(course.id, courseCode);
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
          } else {
            this.instructors = [];
          }

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
        this.toastService.error('Error', 'Failed to load data. Please refresh the page.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    if (!this.schedules) {
      this.filteredSchedules = [];
      return;
    }

    let filtered = [...this.schedules];

    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(schedule => {
        const courseName = this.getCourseName(schedule.course_id)?.toLowerCase() || '';
        const instructorName = this.getInstructorName(schedule.instructor_id)?.toLowerCase() || '';
        const meetingLink = schedule.meeting_link?.toLowerCase() || '';
        return courseName.includes(term) || instructorName.includes(term) || meetingLink.includes(term);
      });
    }

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
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  }

  getCourseName(courseId: number): string {
    if (!courseId) return 'N/A';
    if (this.courseMap.has(courseId)) {
      return this.courseMap.get(courseId) || `Course #${courseId}`;
    }
    return `Course #${courseId}`;
  }

  getCourseCode(courseId: number): string {
    if (!courseId) return 'N/A';
    if (this.courseCodeMap.has(courseId)) {
      return this.courseCodeMap.get(courseId) || '';
    }
    return '';
  }

  getInstructorName(instructorId: number): string {
    if (!instructorId) return 'N/A';
    if (this.instructorMap.has(instructorId)) {
      return this.instructorMap.get(instructorId) || `Instructor #${instructorId}`;
    }
    return `Instructor #${instructorId}`;
  }

  toggleSchedule(index: number): void {
    this.expandedSchedule = this.expandedSchedule === index ? null : index;
  }

  getActiveSchedulesCount(): number {
    return this.filteredSchedules.filter(s => s.status === 'ongoing' || s.status === 'scheduled').length;
  }

  getThisWeekSchedulesCount(): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return this.filteredSchedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
    }).length;
  }

  getDayNumber(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  formatTimeRange(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }

  formatFullDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  onEdit(id: number): void {
    this.router.navigate(['/instructor/class-schedule/edit', id]);
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this class schedule?')) {
      this.scheduleService.deleteSchedule(id).subscribe({
        next: (res: any) => {
          this.toastService.success('Success', res.message || 'Class schedule deleted successfully');
          this.loadInitialData();
        },
        error: (err: any) => {
          this.toastService.error('Error', err.error?.message || 'Failed to delete schedule');
        }
      });
    }
  }

  onView(id: number): void {
    this.router.navigate(['/instructor/class-schedule/view', id]);
  }

  refreshData(): void {
    this.loadInitialData();
  }

  addToCalendar(schedule: any): void {
  const title = `${schedule.course?.course_name || 'Class'} — ${
    schedule.day
      ? schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)
      : 'Class'
  }`;

  this.googleCalendar.addToGoogleCalendar({
    title,
    startTime:   schedule.start_time,
    endTime:     schedule.end_time,
    location:    schedule.meeting_link || '',
    description: [
      `Course: ${schedule.course?.course_name || '-'}`,
      `Batch: ${schedule.batch?.name || '-'}`,
      `Instructor: ${schedule.instructor?.first_name || ''} ${schedule.instructor?.last_name || ''}`,
      `Day: ${schedule.day || '-'}`,
      schedule.note ? `Note: ${schedule.note}` : '',
    ].filter(Boolean).join('\n'),
    day: schedule.day,
  });
}
addAllToCalendar(): void {
  const calSchedules = this.schedules.map(s => ({
    title: `${s.course?.course_name || 'Class'} — ${
      s.day ? s.day.charAt(0).toUpperCase() + s.day.slice(1) : 'Class'
    }`,
    startTime:   s.start_time,
    endTime:     s.end_time,
    location:    s.meeting_link || '',
    description: [
      `Course: ${s.course?.course_name || '-'}`,
      `Batch: ${s.batch?.name || '-'}`,
      `Day: ${s.day || '-'}`,
      s.note ? `Note: ${s.note}` : '',
    ].filter(Boolean).join('\n'),
    day: s.day,
  }));

  this.googleCalendar.addMultipleToGoogleCalendar(calSchedules);
}
}
