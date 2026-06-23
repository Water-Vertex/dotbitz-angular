// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterLink } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { ClassScheduleService } from '../../../../../services/classschedule.service';
// import { ToastService } from '../../../../../services/toast.service';

// interface Course {
//   id: number;
//   course_name?: string;
//   course_code?: string;
//   name?: string;
//   title?: string;
// }

// interface Batch {
//   id: number;
//   name: string;
//   start_date?: string;
//   end_date?: string;
// }

// interface Schedule {
//   id: number;
//   course_id: number;
//   batch_id: number;
//   instructor_id: number;
//   day: string;
//   start_time: string;
//   end_time: string;
//   meeting_link: string;
//   status: string;
//   note: string;
//   course?: any;
//   batch?: Batch;
//   instructor?: any;
// }

// @Component({
//   selector: 'app-class-schedule-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './schedule-list.html',
//   styleUrls: ['./schedule-list.css']
// })
// export class StudentClassScheduleList implements OnInit {
//   // Data properties
//   schedules: Schedule[] = [];
//   filteredSchedules: Schedule[] = [];
//   courses: Course[] = [];

//   // Selected values
//   selectedCourseId: number | null = null;
//   selectedCourse: Course | null = null;

//   // UI state
//   isLoadingCourses = false;
//   isLoadingSchedules = false;
//   expandedSchedule: number | null = null;

//   // Filters
//   searchTerm = '';
//   dayFilter = '';
//   statusFilter = '';

//   // Options
//   dayOptions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//   statusOptions = ['scheduled', 'ongoing', 'completed', 'cancelled'];

//   constructor(
//     private scheduleService: ClassScheduleService,
//     private toastService: ToastService,
//     private router: Router,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.loadCourses();
//   }

//   loadCourses(): void {
//     this.isLoadingCourses = true;
//     this.scheduleService.getStudentCourses().subscribe({
//       next: (res: any) => {
//         this.courses = res.data || [];
//         this.isLoadingCourses = false;
//         this.cdr.detectChanges();
//       },
//       error: (err: any) => {
//         console.error('Error loading courses:', err);
//         this.toastService.error('Error', 'Failed to load your courses');
//         this.isLoadingCourses = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   onCourseChange(): void {
//     if (!this.selectedCourseId) {
//       this.schedules = [];
//       this.filteredSchedules = [];
//       this.selectedCourse = null;
//       return;
//     }

//     this.selectedCourse = this.courses.find(c => c.id === this.selectedCourseId) || null;
//     this.loadSchedules();
//   }

//   loadSchedules(): void {
//     if (!this.selectedCourseId) return;

//     this.isLoadingSchedules = true;
//     this.scheduleService.getStudentSchedulesByCourse(this.selectedCourseId).subscribe({
//       next: (res: any) => {
//         this.schedules = res.data || [];
//         this.applyFilters();
//         this.isLoadingSchedules = false;
//         this.cdr.detectChanges();
//       },
//       error: (err: any) => {
//         console.error('Error loading schedules:', err);
//         this.toastService.error('Error', 'Failed to load class schedules');
//         this.schedules = [];
//         this.isLoadingSchedules = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   applyFilters(): void {
//     let filtered = [...this.schedules];

//     // Apply search filter
//     if (this.searchTerm && this.searchTerm.trim()) {
//       const term = this.searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(schedule => {
//         const courseName = schedule.course?.course_name?.toLowerCase() || '';
//         const instructorName = `${schedule.instructor?.first_name || ''} ${schedule.instructor?.last_name || ''}`.toLowerCase();
//         const batchName = schedule.batch?.name?.toLowerCase() || '';
//         return courseName.includes(term) || instructorName.includes(term) || batchName.includes(term);
//       });
//     }

//     // Apply day filter
//     if (this.dayFilter) {
//       filtered = filtered.filter(schedule => schedule.day === this.dayFilter);
//     }

//     // Apply status filter
//     if (this.statusFilter) {
//       filtered = filtered.filter(schedule => schedule.status === this.statusFilter);
//     }

//     this.filteredSchedules = filtered;
//   }

//   clearFilters(): void {
//     this.searchTerm = '';
//     this.dayFilter = '';
//     this.statusFilter = '';
//     this.applyFilters();
//   }

//   toggleSchedule(index: number): void {
//     this.expandedSchedule = this.expandedSchedule === index ? null : index;
//   }

//   getStatusClass(status: string): string {
//     const statusClasses: { [key: string]: string } = {
//       'scheduled': 'bg-yellow-100 text-yellow-800',
//       'ongoing': 'bg-green-100 text-green-800',
//       'completed': 'bg-blue-100 text-blue-800',
//       'cancelled': 'bg-red-100 text-red-800'
//     };
//     return statusClasses[status] || 'bg-gray-100 text-gray-800';
//   }

//   getDayDisplay(day: string): string {
//     if (!day) return 'N/A';
//     return day.charAt(0).toUpperCase() + day.slice(1);
//   }

//   getDayNumber(dateString: string): string {
//   if (!dateString) return '';
//   // If it's a time string, return empty or a default
//   const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
//   if (timeRegex.test(dateString)) {
//     return ''; // Return empty for time strings
//   }
//   const date = new Date(dateString);
//   return date.getDate().toString();
// }
//   formatTimeRange(startTime: string, endTime: string): string {
//   if (!startTime || !endTime) return 'N/A';

//   // Handle time strings (HH:MM:SS) or date strings
//   const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

//   let start, end;

//   if (timeRegex.test(startTime) && timeRegex.test(endTime)) {
//     // It's a time string
//     const startParts = startTime.split(':');
//     const endParts = endTime.split(':');

//     start = new Date();
//     start.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0);

//     end = new Date();
//     end.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0);
//   } else {
//     // It's a full date string
//     start = new Date(startTime);
//     end = new Date(endTime);
//   }

//   return `${start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
// }

//   formatFullDate(dateString: string): string {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true
//     });
//   }

//   isToday(day: string): boolean {
//     const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
//     return day.toLowerCase() === today;
//   }

//   getNextClassDate(day: string): string {
//     const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//     const today = new Date();
//     const todayIndex = today.getDay();
//     const targetIndex = days.indexOf(day.toLowerCase());

//     let daysToAdd = targetIndex - todayIndex;
//     if (daysToAdd <= 0) daysToAdd += 7;

//     const nextDate = new Date(today);
//     nextDate.setDate(today.getDate() + daysToAdd);

//     return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   }

//   getActiveSchedulesCount(): number {
//     return this.filteredSchedules.filter(s => s.status === 'ongoing' || s.status === 'scheduled').length;
//   }

//   getThisWeekSchedulesCount(): number {
//     const now = new Date();
//     const startOfWeek = new Date(now);
//     startOfWeek.setDate(now.getDate() - now.getDay());
//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 7);

//     return this.filteredSchedules.filter(schedule => {
//       const scheduleDate = new Date(schedule.start_time);
//       return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
//     }).length;
//   }

//   joinMeeting(link: string): void {
//     if (link) {
//       window.open(link, '_blank');
//     }
//   }

//   refreshData(): void {
//     if (this.selectedCourseId) {
//       this.loadSchedules();
//     } else {
//       this.loadCourses();
//     }
//   }
// }


// student-class-schedule-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClassScheduleService } from '../../../../../services/classschedule.service';
import { ToastService } from '../../../../../services/toast.service';
import { GoogleCalendarService } from '../../../../../services/google-calendar.service';

interface Course {
  id: number;
  course_name?: string;
  course_code?: string;
  name?: string;
  title?: string;
}

interface Batch {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
}

interface Schedule {
  id: number;
  course_id: number;
  batch_id: number;
  instructor_id: number;
  day: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  status: string;
  note: string;
  course?: any;
  batch?: Batch;
  instructor?: any;
  google_calendar_link?: string;
}

@Component({
  selector: 'app-class-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-list.html',
  styleUrls: ['./schedule-list.css']
})
export class StudentClassScheduleList implements OnInit {
  // Data properties
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  courses: Course[] = [];

  // Selected values
  selectedCourseId: number | null = null;
  selectedCourse: Course | null = null;

  // UI state
  isLoadingCourses = false;
  isLoadingSchedules = false;
  expandedSchedule: number | null = null;

  // Filters
  searchTerm = '';
  dayFilter = '';
  statusFilter = '';

  // Options
  dayOptions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  statusOptions = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  constructor(
    private scheduleService: ClassScheduleService,
    private toastService: ToastService,
    private googleCalendar: GoogleCalendarService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.scheduleService.getStudentCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.isLoadingCourses = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading courses:', err);
        this.toastService.error('Error', 'Failed to load your courses');
        this.isLoadingCourses = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCourseChange(): void {
    if (!this.selectedCourseId) {
      this.schedules = [];
      this.filteredSchedules = [];
      this.selectedCourse = null;
      return;
    }

    this.selectedCourse = this.courses.find(c => c.id === this.selectedCourseId) || null;
    this.loadSchedules();
  }

  loadSchedules(): void {
    if (!this.selectedCourseId) return;

    this.isLoadingSchedules = true;
    this.scheduleService.getStudentSchedulesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.schedules = res.data || [];
        this.applyFilters();
        this.isLoadingSchedules = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading schedules:', err);
        this.toastService.error('Error', 'Failed to load class schedules');
        this.schedules = [];
        this.isLoadingSchedules = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.schedules];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(schedule => {
        const courseName = schedule.course?.course_name?.toLowerCase() || '';
        const instructorName = `${schedule.instructor?.first_name || ''} ${schedule.instructor?.last_name || ''}`.toLowerCase();
        const batchName = schedule.batch?.name?.toLowerCase() || '';
        return courseName.includes(term) || instructorName.includes(term) || batchName.includes(term);
      });
    }

    // Apply day filter
    if (this.dayFilter) {
      filtered = filtered.filter(schedule => schedule.day === this.dayFilter);
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(schedule => schedule.status === this.statusFilter);
    }

    this.filteredSchedules = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.dayFilter = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  toggleSchedule(index: number): void {
    this.expandedSchedule = this.expandedSchedule === index ? null : index;
  }

  // ✅ Add schedule to Google Calendar
  addScheduleToCalendar(schedule: Schedule): void {
    if (!schedule) return;

    const title = `${this.selectedCourse?.course_name || schedule.course?.course_name || 'Class'} — ${
      schedule.day
        ? schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)
        : 'Class'
    }`;

    const description = [
      `Course: ${this.selectedCourse?.course_name || schedule.course?.course_name || '-'}`,
      `Batch: ${schedule.batch?.name || '-'}`,
      `Instructor: ${schedule.instructor?.first_name || ''} ${schedule.instructor?.last_name || ''}`,
      `Day: ${schedule.day ? this.getDayDisplay(schedule.day) : '-'}`,
      schedule.note ? `\nNote: ${schedule.note}` : '',
    ].filter(Boolean).join('\n');

    this.googleCalendar.addToGoogleCalendar({
      title: title,
      startTime: schedule.start_time,
      endTime: schedule.end_time,
      location: schedule.meeting_link || 'Online Class',
      description: description,
      day: schedule.day,
    });

    this.toastService.success('Google Calendar', 'Opening Google Calendar...');
  }

addAllToGoogleCalendar(): void {
  if (this.filteredSchedules.length === 0) {
    // Use info instead of warning
    this.toastService.info('No Schedules', 'No schedules to add to calendar');
    return;
  }

  const calendarSchedules = this.filteredSchedules.map(schedule => ({
    title: `${this.selectedCourse?.course_name || schedule.course?.course_name || 'Class'} — ${
      schedule.day ? schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1) : 'Class'
    }`,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    location: schedule.meeting_link || 'Online Class',
    description: [
      `Course: ${this.selectedCourse?.course_name || schedule.course?.course_name || '-'}`,
      `Batch: ${schedule.batch?.name || '-'}`,
      `Instructor: ${schedule.instructor?.first_name || ''} ${schedule.instructor?.last_name || ''}`,
      `Day: ${schedule.day ? this.getDayDisplay(schedule.day) : '-'}`,
      schedule.note ? `\nNote: ${schedule.note}` : '',
    ].filter(Boolean).join('\n'),
    day: schedule.day,
  }));

  this.googleCalendar.addMultipleToGoogleCalendar(calendarSchedules);
  this.toastService.success('Google Calendar', `Opening ${calendarSchedules.length} schedules in Google Calendar...`);
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

  getDayDisplay(day: string): string {
    if (!day) return 'N/A';
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  getDayNumber(dateString: string): string {
    if (!dateString) return '';
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (timeRegex.test(dateString)) {
      return '';
    }
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  formatTimeRange(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return 'N/A';

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    let start, end;

    if (timeRegex.test(startTime) && timeRegex.test(endTime)) {
      const startParts = startTime.split(':');
      const endParts = endTime.split(':');
      start = new Date();
      start.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0);
      end = new Date();
      end.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0);
    } else {
      start = new Date(startTime);
      end = new Date(endTime);
    }

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

  isToday(day: string): boolean {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return day.toLowerCase() === today;
  }

  getNextClassDate(day: string): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = days.indexOf(day.toLowerCase());

    let daysToAdd = targetIndex - todayIndex;
    if (daysToAdd <= 0) daysToAdd += 7;

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);

    return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  joinMeeting(link: string): void {
    if (link) {
      window.open(link, '_blank');
    }
  }

  refreshData(): void {
    if (this.selectedCourseId) {
      this.loadSchedules();
    } else {
      this.loadCourses();
    }
  }
}
