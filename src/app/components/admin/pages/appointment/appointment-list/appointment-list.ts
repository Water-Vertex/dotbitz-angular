import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentService, Appointment } from '../../../../../services/appointment.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

interface CourseOption {
  id: string;
  name: string;
  appointmentCount: number;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css']
})
export class AppointmentList implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  searchTerm: string = '';
  selectedCourseId: string = ''; // empty string means "All Courses"
  uniqueCourses: CourseOption[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.appointmentService.getAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          let rawData = res?.data || [];
          if (!Array.isArray(rawData)) rawData = [];

          // Fix thumbnail paths if needed (though not used in UI, but safe)
          rawData.forEach((apt: any) => {
            if (apt.course?.thumbnail_image && !apt.course.thumbnail_image.startsWith('http')) {
              apt.course.thumbnail_image = `https://dotbitz.com/public/assets/images/courses/${apt.course.thumbnail_image}`;
            }
          });

          this.appointments = rawData;
          this.prepareCourseFilterOptions();
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.error('Error', 'Failed to load appointments');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Extract unique courses from appointments for dropdown
  prepareCourseFilterOptions(): void {
    const courseMap = new Map<string, { name: string; count: number }>();
    this.appointments.forEach(apt => {
      const courseId = apt.course_id?.toString() || '';
      const courseName = apt.course?.course_name || 'Unknown Course';
      if (courseId) {
        const existing = courseMap.get(courseId);
        if (existing) {
          existing.count++;
        } else {
          courseMap.set(courseId, { name: courseName, count: 1 });
        }
      }
    });
    this.uniqueCourses = Array.from(courseMap.entries()).map(([id, data]) => ({
      id: id,
      name: data.name,
      appointmentCount: data.count
    }));
  }

  applyFilters(): void {
    let result = [...this.appointments];

    // Filter by selected course
    if (this.selectedCourseId) {
      result = result.filter(apt => apt.course_id?.toString() === this.selectedCourseId);
    }

    // Filter by search term (name, email, phone, course name)
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(apt =>
        apt.name?.toLowerCase().includes(term) ||
        apt.email?.toLowerCase().includes(term) ||
        apt.phone?.includes(term) ||
        apt.course?.course_name?.toLowerCase().includes(term)
      );
    }

    this.filteredAppointments = result;
    this.cdr.detectChanges();
  }

  onSearch(): void {
    this.applyFilters();
  }

  deleteAppointment(id: number): void {
    this.appointmentService.deleteAppointment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Success', 'Record deleted');
          this.loadAppointments(); // Reload list
        },
        error: () => {
          this.toastService.error('Error', 'Failed to delete appointment');
        }
      });
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(time: string): string {
    if (!time) return '-';
    return time;
  }

  trackById(index: number, item: Appointment): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}