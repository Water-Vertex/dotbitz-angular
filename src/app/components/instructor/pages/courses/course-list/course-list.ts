import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/course.model';

@Component({
  selector: 'app-instructor-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.css']
})
export class InstructorCourseList implements OnInit, OnDestroy {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  totalItems = 0;
  searchTerm = '';
  selectedLevel = '';
  selectedStatus = '';
  isLoading = false;
  levels: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  loadCourses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.courseService.getInstructorCourses('', 100).subscribe({
      next: (res: any) => {
        let rawData: Course[] = [];

        // Normalize backend response
        if (res?.data) {
          rawData = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.courses = rawData;

        // Extract unique levels
        this.levels = Array.from(
          new Set(this.courses.map((c) => c.course_level).filter((l): l is string => !!l)),
        );

        // Fix thumbnail paths
        this.courses.forEach((c) => {
          if (c.thumbnail_image && !c.thumbnail_image.startsWith('http')) {
            c.thumbnail_image = `https://dotbitz.com/public/assets/images/courses/${c.thumbnail_image}`;
          } else if (!c.thumbnail_image) {
            c.thumbnail_image = 'https://placehold.co/600x400?text=No+Image';
          }
        });

        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    let result = [...this.courses];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.course_name.toLowerCase().includes(term) ||
          c.course_code.toLowerCase().includes(term)
      );
    }

    // Apply level filter
    if (this.selectedLevel) {
      result = result.filter((c) => c.course_level === this.selectedLevel);
    }

    // Apply status filter
    if (this.selectedStatus) {
      result = result.filter((c) => c.status === this.selectedStatus);
    }

    this.filteredCourses = result;
    this.totalItems = result.length;
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onLevelChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLevel = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  refreshData(): void {
    this.loadCourses();
  }

  getActiveCoursesCount(): number {
    return this.courses.filter(course => course.status === 'active').length;
  }

  getInactiveCoursesCount(): number {
    return this.courses.filter(course => course.status !== 'active').length;
  }

  getUniqueInstructorsCount(): number {
    const uniqueInstructors = new Set(this.courses.map(course => course.instructor_id));
    return uniqueInstructors.size;
  }

  getStatusBadgeClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'inactive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getGradientColor(id: number): string {
    const gradients = [
      'from-purple-500 to-indigo-600',
      'from-blue-500 to-cyan-600',
      'from-orange-500 to-red-600',
      'from-green-500 to-teal-600',
      'from-pink-500 to-rose-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-purple-600',
      'from-red-500 to-pink-600'
    ];
    return gradients[(id || 0) % gradients.length];
  }

  getIconColor(id: number): string {
    const colors = [
      'text-purple-600',
      'text-blue-600',
      'text-orange-600',
      'text-green-600',
      'text-pink-600',
      'text-yellow-600',
      'text-indigo-600',
      'text-red-600'
    ];
    return colors[(id || 0) % colors.length];
  }

  getBadgeTextColor(id: number): string {
    const colors = [
      'text-purple-700',
      'text-blue-700',
      'text-orange-700',
      'text-green-700',
      'text-pink-700',
      'text-yellow-700',
      'text-indigo-700',
      'text-red-700'
    ];
    return colors[(id || 0) % colors.length];
  }

  trackById(index: number, item: Course): number {
    return item.id ?? index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
