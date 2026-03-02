import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssignmentService } from '../../../../../services/assignment.service';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './assignment-list.html',
})
export class AssignmentList implements OnInit {
  assignments: any[] = [];
  courseId!: number;
  loading = true;

// constructor mein:
constructor(
  private route: ActivatedRoute,
  private assignmentService: AssignmentService,
  private cdr: ChangeDetectorRef
) {}


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('courseId');
    if (id) {
      this.courseId = +id;
      this.loadAssignments();
    }
  }

  loadAssignments(): void {
    this.loading = true;
    this.assignmentService.getAssignmentsByCourse(this.courseId).subscribe({
      next: (res: any) => {
        this.assignments = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }
}
