import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignmentService } from '../../../../../services/assignment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Assignment } from '../../../../../models/assignment.model';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './assignment-list.html',
  styleUrls: ['./assignment-list.css'],
})
export class AssignmentList implements OnInit, OnDestroy {
  assignments: Assignment[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignmentService: AssignmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: any) => {
        if (event.url.includes('/admin/assignment')) {
          this.loadAssignments();
        }
      });
  }

  ngOnInit(): void {
    this.loadAssignments();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAssignments();
      });
  }

  loadAssignments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignmentService
      .getAssignments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res.data) ? res.data : [res.data];
          this.assignments = data.filter(
            (a) =>
              !this.searchTerm || a.title.toLowerCase().includes(this.searchTerm.toLowerCase()),
          );
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to load assignments');
          this.isLoading = false;
        },
      });
  }

  refreshData(): void {
    this.loadAssignments();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editAssignment(id: number): void {
    this.router.navigate(['/admin/assignment/edit', id]);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}