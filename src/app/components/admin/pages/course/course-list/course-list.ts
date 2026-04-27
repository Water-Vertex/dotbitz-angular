import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.css']
})
export class CourseList implements OnInit, OnDestroy {

  courses: Course[] = [];
  filteredCourses: Course[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  selectedLevel: string = '';
  selectedStatus: string = '';
  isLoading: boolean = false;
  levels: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.url.includes('/admin/course')) {
        setTimeout(() => this.loadCourses(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadCourses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.courseService.getCourses('', 100).subscribe({
      next: (res: any) => {
        let rawData: Course[] = [];

        // Normalize backend response
        if (res?.data) {
          rawData = Array.isArray(res.data) ? res.data : [];
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
      error: () => {
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
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
          c.course_code.toLowerCase().includes(term) ||
          `${c.instructor?.first_name} ${c.instructor?.last_name}`.toLowerCase().includes(term)
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

  editCourse(id?: number): void {
    if (!id) return;
    this.router.navigate(['/admin/course/edit', id]);
  }

  deleteCourse(id?: number): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this course?')) return;

    this.courseService.deleteCourse(id).subscribe({
      next: (res) => {
        this.toastService.success('Success', res.message || 'Course deleted');
        this.loadCourses();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to delete course');
      }
    });
  }

  trackById(index: number, item: Course): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
