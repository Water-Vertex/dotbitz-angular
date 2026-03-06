import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CourseService } from '../../../../../services/course.service';
import { Course } from '../../../../../models/course.model';

@Component({
  selector: 'app-student-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.html',
})
export class StudentCourseList implements OnInit, OnDestroy {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  totalItems = 0;
  searchTerm = '';
  selectedLevel = '';
  isLoading = false;
  levels: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  loadCourses(): void {
    this.isLoading = true;

    this.courseService.getStudentCourses('', 50).subscribe({
      next: (res: any) => {
        let rawData: Course[] = [];

        // Normalize backend response
        if (res?.data) {
          rawData = Array.isArray(res.data.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];
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
        // Path fixed to match your working URL
        console.log('Original thumbnail:', c.thumbnail_image); // Debug original value
        c.thumbnail_image = `https://dotbitz.com/public/assets/images/courses/${c.thumbnail_image}`;
        console.log('Updated thumbnail:', c.thumbnail_image); // Debug updated value
      } else if (!c.thumbnail_image) {
        c.thumbnail_image = 'https://placehold.co/600x400?text=No+Image+Available';
      }
    });

        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load student courses', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    let result = [...this.courses];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.course_name.toLowerCase().includes(term) || c.course_code.toLowerCase().includes(term),
      );
    }

    if (this.selectedLevel) {
      result = result.filter((c) => c.course_level === this.selectedLevel);
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

  trackById(index: number, item: Course): number {
    return item.id ?? index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}