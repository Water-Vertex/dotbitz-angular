import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssignAssessmentService } from '../../../../../services/assignedassessment.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-guest-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-list.html',
  styleUrls: ['./assessment-list.css'],
})
export class GuestAssessmentList implements OnInit, OnDestroy {
  assessments: any[] = [];
  filteredAssessments: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  guestEmail: string | null = '';
  showStartConfirm = false;
  selectedAssessmentItem: any = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assignService: AssignAssessmentService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        if (event.urlAfterRedirects.includes('/guest/guest-assessments')) {
          this.loadGuestAssessments();
        }
      });
  }

  ngOnInit(): void {
    const emailFromUrl = this.route.snapshot.queryParamMap.get('email');

    if (emailFromUrl) {
      localStorage.setItem('guest_email', emailFromUrl);
      this.guestEmail = emailFromUrl;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { email: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    } else {
      this.guestEmail = localStorage.getItem('guest_email');
    }

    if (this.guestEmail) {
      this.loadGuestAssessments();
    } else {
      this.toastService.error('Error', 'Invalid access link.');
    }

    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.applyFilter(term);
      });
  }

  loadGuestAssessments(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assignService
      .getGuestAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.assessments = response?.data || [];
          this.applyFilter(this.searchTerm);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('API Error:', error);
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
          item.assessment_query?.course?.course_name?.toLowerCase().includes(lowerTerm) ||
          item.assessment?.assessment_title?.toLowerCase().includes(lowerTerm),
      );
    }
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  refreshData(): void {
    this.loadGuestAssessments();
  }

  onStartTest(item: any): void {
    if (this.isOverdue(item.due_date)) {
      this.toastService.error('Error', 'This assessment is overdue!');
      return;
    }
    this.selectedAssessmentItem = item;
    this.showStartConfirm = true;
  }

  cancelStart(): void {
    this.showStartConfirm = false;
    this.selectedAssessmentItem = null;
  }

  confirmStart(): void {
    this.showStartConfirm = false;
    if (this.selectedAssessmentItem) {
      this.router.navigate(['/guest/assessment/attempt', this.selectedAssessmentItem.id]);
    }
  }

  // ✅ View Attempt Method
  onViewAttempt(item: any): void {
    if (!this.canViewAttempt(item)) {
      return;
    }
    this.router.navigate(['/guest/assessment/view', item.id]);
  }

  // ✅ Check if view button should be enabled
  canViewAttempt(item: any): boolean {
    // Sirf tab enable jab test attempt ho chuka ho (completed ya time_up)
    const hasAttempt = item.attempt?.status === 'completed' ||
                       item.attempt?.status === 'time_up';
    return hasAttempt;
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;

    try {
      const dateOnly = dueDate.split('T')[0].split(' ')[0];
      const [year, month, day] = dateOnly.split('-');

      const dueUTC = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      ));

      const todayUTC = new Date();
      const todayDateOnly = new Date(Date.UTC(
        todayUTC.getUTCFullYear(),
        todayUTC.getUTCMonth(),
        todayUTC.getUTCDate()
      ));

      return dueUTC < todayDateOnly;
    } catch (e) {
      return false;
    }
  }

  formatDateOnly(dbDate: string): string {
    if (!dbDate) return '---';

    try {
      let dateOnly = dbDate.split('T')[0];
      if (dateOnly.includes(' ')) {
        dateOnly = dateOnly.split(' ')[0];
      }

      const [year, month, day] = dateOnly.split('-');

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[parseInt(month) - 1];

      return `${parseInt(day)} ${monthName} ${year}`;
    } catch(e) {
      return dbDate;
    }
  }

  onResumeTest(item: any): void {
  this.router.navigate(['/guest/assessment/attempt', item.id]);
}
}
