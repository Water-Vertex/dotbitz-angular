import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { AssessmentService } from '../../../../../services/assessment.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assessment-list.html',
})
export class AssessmentList implements OnInit, OnDestroy {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  totalItems: number = 0;
  isLoading: boolean = false;

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,  
  ) {}

  
  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  ngOnInit(): void {
    this.loadAssessments();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilter();
      });
  }

  loadAssessments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assessmentService.getAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Handle different response structures
          if (res?.data?.assessments) {
            this.assessments = res.data.assessments;
          } else if (res?.data) {
            this.assessments = Array.isArray(res.data) ? res.data : [];
          } else if (Array.isArray(res)) {
            this.assessments = res;
          } else {
            this.assessments = [];
          }

          this.applyFilter();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading assessments:', error);
          this.toastService.error('Error', 'Failed to load assessments');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyFilter(): void {
    const searchTerm = (this.searchControl.value || '').toLowerCase().trim();

    if (!searchTerm) {
      this.filteredAssessments = [...this.assessments];
    } else {
      this.filteredAssessments = this.assessments.filter(assessment =>
        assessment.assessment_title?.toLowerCase().includes(searchTerm) ||
        assessment.course?.course_name?.toLowerCase().includes(searchTerm)
      );
    }

    this.totalItems = this.filteredAssessments.length;
    this.cdr.detectChanges();
  }

  refreshData(): void {
    this.loadAssessments();
  }

  deleteAssessment(id: number): void {
    if (!confirm('Are you sure you want to delete this assessment?')) return;

    this.assessmentService.deleteAssessment(id).subscribe({
      next: (res) => {
        this.toastService.success('Success', res?.message || 'Assessment deleted successfully');
        this.loadAssessments();
      },
      error: (error) => {
        console.error('Error deleting assessment:', error);
        this.toastService.error('Error', error?.message || 'Failed to delete assessment');
      }
    });
  }

  trackById(index: number, item: any): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
