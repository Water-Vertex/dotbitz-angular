import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentService } from '../../../../../services/assignment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Assignment } from '../../../../../models/assignment.model';


@Component({
  selector: 'app-instructor-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assignment-list.html',
})
export class InstructorAssignmentList implements OnInit {

  assignments: any[] = [];
  allAssignments: any[] = [];
  courses: any[] = [];
  selectedCourseId: number | null = null;
  loading = false;
  deleting: number | null = null;

  constructor(
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadAssignments();
  }

  loadCourses(): void {
    this.assignmentService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadAssignments(): void {
    this.loading = true;
    this.assignmentService.getInstructorAssignments().subscribe({
      next: (res: any) => {
        this.allAssignments = res.data || [];
        this.assignments    = [...this.allAssignments];
        this.loading        = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  onCourseFilter(): void {
    if (!this.selectedCourseId) {
      this.assignments = [...this.allAssignments];
    } else {
      this.assignments = this.allAssignments.filter(a => a.course_id == this.selectedCourseId);
    }
    this.cdr.detectChanges();
  }

  deleteAssignment(id: number): void {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    // Optimistic UI remove
    const index = this.assignments.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.assignments.splice(index, 1);
      this.cdr.detectChanges();
    }

    this.assignmentService.deleteAssignment(id).subscribe({
      next: (res) => {
        this.toastService.success('Success', res?.message || 'Assignment deleted');
        this.loadAssignments();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to delete assignment');
        this.loadAssignments();
      },
    });
  }
   trackById(index: number, assignment: Assignment): number {
      return assignment.id!;
    }

  onEdit(id: number): void {
    this.router.navigate(['/instructor/assignment/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    this.deleting = id;
    this.assignmentService.deleteInstructorAssignment(id).subscribe({
      next: () => {
        this.deleting       = null;
        this.allAssignments = this.allAssignments.filter(a => a.id !== id);
        this.assignments    = this.assignments.filter(a => a.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.deleting = null;
        alert('Failed to delete assignment.');
      }
    });
  }
}
