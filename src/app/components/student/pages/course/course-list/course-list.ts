import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CourseService } from '../../../../../services/course.service';  // same service as admin
import { Course } from '../../../../../models/course.model';              // same model as admin
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-student-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-list.html'
})
export class StudentCourseList implements OnInit, OnDestroy {

  courses: Course[] = [];
  filteredCourses: Course[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;
  selectedLevel: string = '';

  // Unique levels for filter dropdown
  levels: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private courseService: CourseService,    private cdr: ChangeDetectorRef,
) {}

  ngOnInit(): void {
    this.loadCourses();

    // Debounced search — same pattern as admin
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadCourses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();   // 🔥 IMPORTANT


    // ✅ Same service, same API — sirf per_page 50 set kiya
    this.courseService.getCourses('', 50).subscribe({
      next: (res) => {
        this.courses = Array.isArray(res.data) ? res.data : [];

        // Extract unique levels for filter
        const levelSet = new Set(
          this.courses
            .map(c => c.course_level)
            .filter((l): l is string => !!l)
        );
        this.levels = Array.from(levelSet);

        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();   // 🔥 IMPORTANT

      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();   // 🔥 IMPORTANT

      }
    });
  }

  // Client-side filter (search + level)
  applyFilters(): void {
    let result = [...this.courses];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.course_name.toLowerCase().includes(term) ||
        c.course_code.toLowerCase().includes(term)
      );
    }

    if (this.selectedLevel) {
      result = result.filter(c => c.course_level === this.selectedLevel);
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

  // getImageUrl(thumbnail: string | undefined): string {
  //   if (!thumbnail) return 'assets/images/course-placeholder.png';
  //   return `http://localhost:8000/assets/images/courses/${thumbnail}`;
  // }

  trackById(index: number, item: Course): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}