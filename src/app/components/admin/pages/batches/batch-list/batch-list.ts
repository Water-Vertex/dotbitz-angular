import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter, forkJoin } from 'rxjs';
import { BatchService } from '../../../../../services/batch.service';
import { InstructorService } from '../../../../../services/instructor.service';
import { CourseService } from '../../../../../services/course.service';
import { ToastService } from '../../../../../services/toast.service';
import { BatchCard } from '../batch-card/batch-card';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './batch-list.html',
  styleUrls: ['./batch-list.css']
})
export class BatchList implements OnInit, OnDestroy {
  batches: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  // Cache for instructor and course names
  private instructorCache: Map<number, string> = new Map();
  private courseCache: Map<number, string> = new Map();

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private batchService: BatchService,
    private instructorService: InstructorService,
    private courseService: CourseService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Listen for navigation events to reload data when returning to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      // Only reload if we're navigating to this component
      if (event.url === '/admin/batches/list' || event.url.includes('/admin/batches')) {
        console.log('Navigation detected, reloading batches');
        setTimeout(() => {
          this.loadBatches();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('Batch List Component initialized');

    // Load data immediately
    this.loadBatches();

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadBatches();
    });
  }

  loadBatches(): void {
    console.log('Loading batches...');
    this.isLoading = true;
    this.cdr.detectChanges(); // Update UI to show loading

    this.batchService.getBatches(this.searchTerm).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        // Extract batches array from response
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

        // Process batches to fetch instructor and course names
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
      this.totalItems = 0;
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    // Collect unique instructor and course IDs
    const instructorIds = [...new Set(batchesArray.map(b => b.instructor_id).filter(id => id))];
    const courseIds = [...new Set(batchesArray.map(b => b.course_id).filter(id => id))];

    console.log('Unique instructor IDs:', instructorIds);
    console.log('Unique course IDs:', courseIds);

    // Create observables for fetching missing instructor names
    const instructorRequests = instructorIds.map(id => {
      if (this.instructorCache.has(id)) {
        return null; // Already in cache
      }
      return this.instructorService.getInstructor(id).pipe(
        takeUntil(this.destroy$)
      );
    }).filter(req => req !== null);

    // Create observables for fetching missing course names
    const courseRequests = courseIds.map(id => {
      if (this.courseCache.has(id)) {
        return null; // Already in cache
      }
      return this.courseService.getCourse(id).pipe(
        takeUntil(this.destroy$)
      );
    }).filter(req => req !== null);

    // Combine all requests
    const allRequests = [...instructorRequests, ...courseRequests];

    if (allRequests.length === 0) {
      // All names are already in cache
      this.mapBatchNames(batchesArray);
    } else {
      // Fetch missing names
      forkJoin(allRequests).subscribe({
        next: (responses: any[]) => {
          console.log('Fetched names responses:', responses);

          // Update caches with new data
          responses.forEach((response: any) => {
            const data = response?.data || response;

            if (data && data.id) {
              // Check if it's an instructor (has name field)
              if (data.name || data.first_name || data.last_name) {
                const instructorName = data.name ||
                                      data.full_name ||
                                      `${data.first_name || ''} ${data.last_name || ''}`.trim();
                if (instructorName) {
                  this.instructorCache.set(data.id, instructorName);
                }
              }
              // Check if it's a course (has course_name field)
              else if (data.course_name || data.name) {
                const courseName = data.course_name || data.name || data.title;
                if (courseName) {
                  this.courseCache.set(data.id, courseName);
                }
              }
            }
          });

          // Now map the batch names using updated cache
          this.mapBatchNames(batchesArray);
        },
        error: (error) => {
          console.error('Error fetching names:', error);
          // Still show batches with IDs as fallback
          this.mapBatchNames(batchesArray);
        }
      });
    }
  }

 mapBatchNames(batchesArray: any[]): void {
  this.batches = batchesArray.map(batch => {
    // Get instructor name from cache or use fallback
    let instructorName = 'N/A';
    if (batch.instructor_id) {
      instructorName = this.instructorCache.get(batch.instructor_id) ||
                      `Instructor #${batch.instructor_id}`;
    }

    // Get course name from cache or use fallback
    let courseName = 'N/A';
    if (batch.course_id) {
      courseName = this.courseCache.get(batch.course_id) ||
                  `Course #${batch.course_id}`;
    }

    // Calculate students count from comma-separated string
    let studentsCount = 0;
    if (batch.students) {
      if (typeof batch.students === 'string') {
        // If it's a comma-separated string like "14,17"
        studentsCount = batch.students.split(',').filter((id: string) => id.trim() !== '').length;
      } else if (Array.isArray(batch.students)) {
        // If it's already an array
        studentsCount = batch.students.length;
      } else if (typeof batch.students === 'number') {
        // If it's a single number
        studentsCount = 1;
      }
    }

    return {
      ...batch,
      instructor_name: instructorName,
      course_name: courseName,
      students_count: studentsCount,
      // Also store the original students data for reference if needed
      _original_students: batch.students
    };
  });

  this.totalItems = this.batches.length;
  console.log('Batches with names:', this.batches);

  this.isLoading = false;
  this.cdr.detectChanges();
}

  // Add a manual refresh method
  refreshData(): void {
    console.log('Manual refresh triggered');
    // Clear caches on manual refresh to get fresh data
    this.instructorCache.clear();
    this.courseCache.clear();
    this.loadBatches();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editBatch(id: number): void {
    this.router.navigate(['/admin/batches/edit', id]);
  }

  deleteBatch(id: number): void {
    if (confirm('Are you sure you want to delete this batch?')) {
      console.log('Deleting batch ID:', id);

      // Optimistically remove from UI
      const index = this.batches.findIndex(batch => batch.id === id);
      if (index !== -1) {
        this.batches.splice(index, 1);
        this.totalItems = this.batches.length;
        this.cdr.detectChanges(); // Update UI immediately
      }

      this.batchService.deleteBatch(id).subscribe({
        next: (response: any) => {
          console.log('Delete successful:', response);
          this.toastService.success('Success', response?.message || 'Batch deleted successfully!');

          // Reload to ensure sync with server
          this.loadBatches();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.toastService.error('Error', 'Failed to delete batch. Please try again.');

          // Reload data to revert optimistic update if failed
          this.loadBatches();
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, batch: any): number {
    return batch.id;
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

// Add these methods to your BatchList class

getBatchesByStatus(status: string): any[] {
  return this.batches.filter(batch =>
    (batch.status?.toLowerCase() || 'active') === status.toLowerCase()
  );
}

getTotalStudents(): number {
  return this.batches.reduce((total, batch) => total + (batch.students_count || 0), 0);
}

getUniqueCoursesCount(): number {
  const uniqueCourses = new Set(this.batches.map(batch => batch.course_id));
  return uniqueCourses.size;
}

getCompletionRate(): number {
  const completedBatches = this.batches.filter(batch => batch.status === 'completed').length;
  if (this.batches.length === 0) return 0;
  return Math.round((completedBatches / this.batches.length) * 100);
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


}
