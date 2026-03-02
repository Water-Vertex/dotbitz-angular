import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesByStudentService } from '../../../../../../services/coursesbystudent.service';
import { Subject, takeUntil } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-courses-guardian',
  standalone: true,
  imports: [CommonModule, FormsModule , RouterLink],
  templateUrl: './courses.html',
})
export class MyCoursesGuardian implements OnInit, OnDestroy {
  students: any[] = [];
  courses: any[] = [];
  selectedStudentId: number | null = null;
  loadingStudents = false;
  loadingCourses = false;

  private destroy$ = new Subject<void>();

  constructor(
    private coursesService: CoursesByStudentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.loadingStudents = true;
    this.coursesService
      .getGuardianStudents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res && res.students) {
            this.students = res.students;
          } else if (res.data && res.data.students) {
            this.students = res.data.students;
          }
          this.loadingStudents = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching students:', err);
          this.loadingStudents = false;
          this.cdr.detectChanges();
        },
      });
  }

  // FIXED: Method now accepts string value directly from template
  onStudentSelect(studentIdValue: string): void {
    const studentId = studentIdValue ? Number(studentIdValue) : null;
    this.selectedStudentId = studentId;
    this.courses = [];

    if (!studentId) return;

    this.loadingCourses = true;
    this.coursesService
      .getCoursesByStudent(studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const rawData = res.data || res || [];

          this.courses = rawData.map((enrollment: any) => {
            const course = enrollment.course;
            if (course) {
              if (course.thumbnail_image && !course.thumbnail_image.startsWith('http')) {
                course.thumbnail_image = `https://dotbitz.com/public/assets/images/courses/${course.thumbnail_image}`;
              } else if (!course.thumbnail_image) {
                course.thumbnail_image = 'https://placehold.co/600x400?text=No+Image+Available';
              }
            }
            return enrollment;
          });

          this.loadingCourses = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching courses:', err);
          this.loadingCourses = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
