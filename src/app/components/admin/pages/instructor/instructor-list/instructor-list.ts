import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { InstructorService } from '../../../../../services/instructor.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-instructor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './instructor-list.html',
  styleUrls: ['./instructor-list.css']
})
export class InstructorList implements OnInit, OnDestroy {

  instructors: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private instructorService: InstructorService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Reload when navigating back
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.url.includes('/admin/instructor')) {
        setTimeout(() => this.loadInstructors(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.loadInstructors();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadInstructors();
    });
  }

loadInstructors(): void {
  this.isLoading = true;
  this.cdr.detectChanges();

  // Pass the searchTerm from component
  this.instructorService.getInstructors(this.searchTerm)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          this.instructors = response.data;
        } else {
          this.instructors = [];
        }

        this.totalItems = this.instructors.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load instructors');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
}



  refreshData(): void {
    this.loadInstructors();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editInstructor(id: number): void {
    this.router.navigate(['/admin/instructor/edit', id]);
  }

  deleteInstructor(id: number): void {
    if (!confirm('Are you sure you want to delete this instructor?')) return;

    const index = this.instructors.findIndex(i => i.id === id);
    if (index !== -1) {
      this.instructors.splice(index, 1);
      this.totalItems = this.instructors.length;
      this.cdr.detectChanges();
    }

    this.instructorService.deleteInstructor(id).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res?.message || 'Instructor deleted');
        this.loadInstructors();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to delete instructor');
        this.loadInstructors();
      }
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
