import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter, forkJoin } from 'rxjs';
import { BatchService } from '../../../../../services/batch.service';
import { InstructorService } from '../../../../../services/instructor.service';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-instructor-batch-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './batch-list.html',
  styleUrls: ['./batch-list.css']
})
export class InstructorBatchList implements OnInit, OnDestroy {
  batches: any[] = [];
  filteredBatches: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;
  selectedStatus: string = '';

  // Cache for instructor and course names
  private instructorCache: Map<number, string> = new Map();
  private courseCache: Map<number, string> = new Map();

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Status options for filter
  statusOptions = ['active', 'upcoming', 'completed', 'cancelled'];

  constructor(
    private batchService: BatchService,
    private instructorService: InstructorService,
    private courseService: CourseService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.url === '/instructor/batches/list' || event.url.includes('/instructor/batches')) {
        console.log('Navigation detected, reloading batches');
        setTimeout(() => {
          this.loadBatches();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('Instructor Batch List Component initialized');
    this.loadBatches();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  loadBatches(): void {
    console.log('Loading instructor batches...');
    this.isLoading = true;
    this.cdr.detectChanges();

    this.batchService.getInstructorBatches(this.searchTerm).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        let batchesArray: any[] = [];

        if (response?.data && Array.isArray(response.data)) {
          batchesArray = response.data;
        } else if (Array.isArray(response)) {
          batchesArray = response;
        } else if (response?.batches && Array.isArray(response.batches)) {
          batchesArray = response.batches;
        } else {
          batchesArray = [];
        }

        this.processBatchesWithNames(batchesArray);
      },
      error: (error) => {
        console.error('Error loading batches:', error);
        this.toastService.error('Error', 'Failed to load batches. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  processBatchesWithNames(batchesArray: any[]): void {
    if (batchesArray.length === 0) {
      this.batches = [];
      this.filteredBatches = [];
      this.totalItems = 0;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const instructorIds = [...new Set(batchesArray.map(b => b.instructor_id).filter(id => id))];
    const courseIds = [...new Set(batchesArray.map(b => b.course_id).filter(id => id))];

    console.log('Unique instructor IDs:', instructorIds);
    console.log('Unique course IDs:', courseIds);

    const instructorRequests = instructorIds.map(id => {
      if (this.instructorCache.has(id)) return null;
      return this.instructorService.getInstructor(id).pipe(takeUntil(this.destroy$));
    }).filter(req => req !== null);

    const courseRequests = courseIds.map(id => {
      if (this.courseCache.has(id)) return null;
      return this.courseService.getCourse(id).pipe(takeUntil(this.destroy$));
    }).filter(req => req !== null);

    const allRequests = [...instructorRequests, ...courseRequests];

    if (allRequests.length === 0) {
      this.mapBatchNames(batchesArray);
    } else {
      forkJoin(allRequests).subscribe({
        next: (responses: any[]) => {
          responses.forEach((response: any) => {
            const data = response?.data || response;
            if (data && data.id) {
              if (data.name || data.first_name || data.last_name) {
                const instructorName = data.name || data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim();
                if (instructorName) this.instructorCache.set(data.id, instructorName);
              } else if (data.course_name || data.name) {
                const courseName = data.course_name || data.name || data.title;
                if (courseName) this.courseCache.set(data.id, courseName);
              }
            }
          });
          this.mapBatchNames(batchesArray);
        },
        error: (error) => {
          console.error('Error fetching names:', error);
          this.mapBatchNames(batchesArray);
        }
      });
    }
  }

  mapBatchNames(batchesArray: any[]): void {
    this.batches = batchesArray.map(batch => {
      let instructorName = 'N/A';
      if (batch.instructor_id) {
        instructorName = this.instructorCache.get(batch.instructor_id) || `Instructor #${batch.instructor_id}`;
      }

      let courseName = 'N/A';
      if (batch.course_id) {
        courseName = this.courseCache.get(batch.course_id) || `Course #${batch.course_id}`;
      }

      let studentsCount = 0;
      if (batch.students) {
        if (typeof batch.students === 'string') {
          studentsCount = batch.students.split(',').filter((id: string) => id.trim() !== '').length;
        } else if (Array.isArray(batch.students)) {
          studentsCount = batch.students.length;
        } else if (typeof batch.students === 'number') {
          studentsCount = 1;
        }
      }

      return {
        ...batch,
        instructor_name: instructorName,
        course_name: courseName,
        students_count: studentsCount,
        _original_students: batch.students
      };
    });

    this.applyFilters();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    let result = [...this.batches];

    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(batch =>
        batch.name?.toLowerCase().includes(term) ||
        batch.course_name?.toLowerCase().includes(term) ||
        batch.instructor_name?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      result = result.filter(batch => batch.status === this.selectedStatus);
    }

    this.filteredBatches = result;
    this.totalItems = result.length;
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  refreshData(): void {
    this.instructorCache.clear();
    this.courseCache.clear();
    this.loadBatches();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  editBatch(id: number): void {
    this.router.navigate(['/instructor/batches/edit', id]);
  }

 
  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getBatchesByStatus(status: string): any[] {
    return this.filteredBatches.filter(batch =>
      (batch.status?.toLowerCase() || 'active') === status.toLowerCase()
    );
  }

  getTotalStudents(): number {
    return this.filteredBatches.reduce((total, batch) => total + (batch.students_count || 0), 0);
  }

  getUniqueCoursesCount(): number {
    const uniqueCourses = new Set(this.filteredBatches.map(batch => batch.course_id));
    return uniqueCourses.size;
  }

  getCompletionRate(): number {
    const completedBatches = this.filteredBatches.filter(batch => batch.status === 'completed').length;
    if (this.filteredBatches.length === 0) return 0;
    return Math.round((completedBatches / this.filteredBatches.length) * 100);
  }

  calculateDuration(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Less than a day';
    if (diffDays === 1) return '1 day';
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    return `${Math.round(diffDays / 365)} years`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  trackById(index: number, batch: any): number {
    return batch.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
