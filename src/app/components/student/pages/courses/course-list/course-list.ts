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
  templateUrl: './course-list.html'
})
export class StudentCourseList implements OnInit, OnDestroy {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;
  selectedLevel: string = '';
  levels: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CourseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadCourses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    // ✅ Student-specific API
    this.courseService.getStudentCourses('', 50).subscribe({
      next: (res) => {
        this.courses = Array.isArray(res.data) ? res.data : [];

        // Extract unique levels
        const levelSet = new Set(
          this.courses.map(c => c.course_level).filter((l): l is string => !!l)
        );
        this.levels = Array.from(levelSet);

        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching student courses:', err);

        // 401 handling: redirect to login if needed
        if (err.status === 401) {
          localStorage.removeItem('token'); // remove invalid token
          window.location.href = '/student/login';
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

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

  trackById(index: number, item: Course): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}