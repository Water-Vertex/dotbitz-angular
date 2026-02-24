import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssignmentService } from '../../../../services/assignment.service';

@Component({
  selector: 'app-assignment-guardian',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './assignment-guardian.html',
})
export class AssignmentGuardian implements OnInit {
  assignments: any[] = [];
  courseId!: number;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('courseId');

    if (id) {
      this.courseId = +id;
      this.loadAssignments();
    } else {
      this.loading = false;
    }
  }

  loadAssignments(): void {
    this.loading = true;

    this.assignmentService.getAssignmentsGuardian(this.courseId).subscribe({
      next: (res: any) => {
        if (res?.success && res?.assignments) {
          this.assignments = res.assignments;
        } else if (res?.data) {
          this.assignments = res.data;
        } else {
          this.assignments = [];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.assignments = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
}
