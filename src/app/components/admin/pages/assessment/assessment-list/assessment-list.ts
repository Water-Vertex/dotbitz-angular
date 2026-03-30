// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink, NavigationEnd } from '@angular/router';
// import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
// import { AssessmentService } from '../../../../../services/assessment.service';
// import { ToastService } from '../../../../../services/toast.service';

// @Component({
//   selector: 'app-assessment-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './assessment-list.html',
// })
// export class AssessmentList implements OnInit, OnDestroy {
//   assessments: any[] = [];
//   totalItems = 0;
//   searchTerm = '';
//   isLoading = false;

//   private searchSubject = new Subject<string>();
//   private destroy$ = new Subject<void>();

//   constructor(
//     private assessmentService: AssessmentService,
//     private toastService: ToastService,
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//   ) {}

//   ngOnInit(): void {
//     this.loadAssessments();

//     this.searchSubject
//       .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
//       .subscribe(() => this.loadAssessments());
//   }

//   loadAssessments(): void {
//     this.isLoading = true;
//     this.cdr.detectChanges();

//     this.assessmentService
//       .getAssessments()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (res: any) => {
//           console.log(res); // keep for debug
//           this.assessments = res?.data?.assessments || [];
//           this.totalItems = this.assessments.length;
//           this.isLoading = false;
//           this.cdr.detectChanges();
//         },
//         error: () => {
//           this.toastService.error('Error', 'Failed to load assessments');
//           this.isLoading = false;
//         },
//       });
//   }

//   refreshData(): void {
//     this.loadAssessments();
//   }

//   onSearch(): void {
//     this.searchSubject.next(this.searchTerm);
//   }

//   deleteAssessment(id: number): void {
//     if (!confirm('Delete this assessment?')) return;

//     this.assessmentService.deleteAssessment(id).subscribe({
//       next: () => {
//         this.toastService.success('Success', 'Assessment deleted');
//         this.loadAssessments();
//       },
//       error: () => {
//         this.toastService.error('Error', 'Delete failed');
//       },
//     });
//   }

//   trackById(index: number, item: any): number {
//     return item.id;
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// }

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { AssessmentService } from '../../../../../services/assessment.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './assessment-list.html',
})
export class AssessmentList implements OnInit, OnDestroy {
  assessments: any[] = [];
  totalItems = 0;
  searchTerm = '';
  isLoading = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private assessmentService: AssessmentService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAssessments();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadAssessments());
  }

  loadAssessments(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.assessmentService
      .getAssessments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.assessments = res?.data?.assessments || [];
          this.totalItems = this.assessments.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.error('Error', 'Failed to load assessments');
          this.isLoading = false;
        },
      });
  }

  refreshData(): void {
    this.loadAssessments();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  deleteAssessment(id: number): void {
    if (!confirm('Delete this assessment?')) return;

    this.assessmentService.deleteAssessment(id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Assessment deleted');
        this.loadAssessments();
      },
      error: () => {
        this.toastService.error('Error', 'Delete failed');
      },
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}