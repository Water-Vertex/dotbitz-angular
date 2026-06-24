import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignAssessmentService } from '../../../../../../services/assignedassessment.service';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-assigned-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assigned-assessment-list.html',
  styleUrls: ['./assigned-assessment-list.css'],
})
export class AssignAssessmentList implements OnInit, OnDestroy {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignService: AssignAssessmentService,
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
        if (event.url.includes('/admin/assign-assessments')) {
          this.loadAssessments();
        }
      });
  }

  ngOnInit(): void {
    this.loadAssessments();

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.applyFilter(term);
      });
  }

  loadAssessments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignService
      .getAssignAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.assessments = response?.data || [];
          this.applyFilter(this.searchTerm);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.error('Error', 'Failed to load assessments.');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  applyFilter(term: string): void {
    if (!term) {
      this.filteredAssessments = [...this.assessments];
    } else {
      const lowerTerm = term.toLowerCase();

      this.filteredAssessments = this.assessments.filter(
        (item) =>
          item.assessment_query?.full_name?.toLowerCase().includes(lowerTerm) ||
          item.assessment_query?.email?.toLowerCase().includes(lowerTerm) ||
          item.assessment_query?.course?.course_name?.toLowerCase().includes(lowerTerm) ||
          item.assessment?.assessment_title?.toLowerCase().includes(lowerTerm),
      );
    }

    this.totalItems = this.filteredAssessments.length;
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  refreshData(): void {
    this.loadAssessments();
  }

  // Navigation to view assessment details
  openAssessment(id: number): void {
    this.router.navigate(['/admin/assign-assessments/view', id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
