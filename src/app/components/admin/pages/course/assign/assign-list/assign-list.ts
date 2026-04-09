import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignCourseService } from '../../../../../../services/assigncourse.service';
import { CourseService } from '../../../../../../services/course.service';

@Component({
  selector: 'app-assign-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assign-list.html',
})
export class AssignCourseList implements OnInit {

  assignments: any[] = [];
  courses: any[] = [];
  selectedCourseId: number | null = null;
  loading = false;
  deleting: number | null = null;

  constructor(
    private assignCourseService: AssignCourseService,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadAssignments();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadAssignments(courseId?: number): void {
    this.loading = true;
    this.assignCourseService.getAssignments(courseId).subscribe({
      next: (res: any) => {
        this.assignments = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onCourseFilter(): void {
    this.loadAssignments(this.selectedCourseId ?? undefined);
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/assign-course/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    this.deleting = id;
    this.assignCourseService.deleteAssignment(id).subscribe({
      next: (res: any) => {
        this.deleting = null;
        if (res.success) {
          this.assignments = this.assignments.filter(a => a.id !== id);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.deleting = null;
        alert('Failed to delete assignment.');
      }
    });
  }
}