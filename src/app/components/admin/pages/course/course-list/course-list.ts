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
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

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
    ).subscribe(() => this.loadCourses());
  }

  loadCourses(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.courseService.getCourses(this.searchTerm, 50).subscribe({
      next: (res) => {
        this.courses = Array.isArray(res.data) ? res.data : [];
        this.totalItems = this.courses.length;
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

  refreshData(): void {
    this.loadCourses();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
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
