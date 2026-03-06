import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../services/course.service';
import { AssignmentService } from '../../../../services/assignment.service';

@Component({
  selector: 'app-view-course-student',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-course-student.html',
})
export class ViewCourseStudent implements OnInit {
  course: any = null;
  courseId!: number;
  loading = true;
  activeTab: 'instructor' | 'curriculum' | 'assignment' | 'quiz' = 'instructor';

  // Assignment tab
  assignments: any[] = [];
  assignmentsLoading = false;
  assignmentsLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('courseId');
      if (id) {
        this.courseId = +id;
        this.loadCourse();
      }
    });
  }

  loadCourse(): void {
    this.loading = true;
    this.courseService.getStudentCourseDetail(this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

setTab(tab: string): void {
  this.activeTab = tab as 'instructor' | 'curriculum' | 'assignment' | 'quiz';
  if (tab === 'assignment' && !this.assignmentsLoaded) {
    this.loadAssignments();
  }
}

  loadAssignments(): void {
    this.assignmentsLoading = true;
    this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
      next: (res: any) => {
        this.assignments = res.data || [];
        this.assignmentsLoaded = true;
        this.assignmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Assignments error:', err);
        this.assignmentsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }
}