import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { CourseCurriculum } from '../../../../../models/coursecurriculum.model';

@Component({
  selector: 'app-course-curriculum-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-curriculum-list.html',
})
export class CourseCurriculumList implements OnInit, OnDestroy {
  curriculums: CourseCurriculum[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private curriculumService: CourseCurriculumService,
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
        if (event.url.includes('/admin/course-curriculum')) {
          this.loadCurriculums();
        }
      });
  }

  ngOnInit(): void {
    this.loadCurriculums();

    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCurriculums();
      });
  }

  loadCurriculums(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.curriculumService
      .getCurriculums()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res.data) ? res.data : [res.data];
          this.curriculums = data.filter(
            (c) =>
              !this.searchTerm || c.title.toLowerCase().includes(this.searchTerm.toLowerCase()),
          );
          this.totalItems = this.curriculums.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', 'Failed to load curriculums');
          this.isLoading = false;
        },
      });
  }

  refreshData(): void {
    this.loadCurriculums();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editCurriculum(id: number): void {
    this.router.navigate(['/admin/course-curriculum/edit', id]);
  }

  deleteCurriculum(id: number): void {
    if (!confirm('Are you sure you want to delete this curriculum?')) return;

    // Optimistic UI remove
    const index = this.curriculums.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.curriculums.splice(index, 1);
      this.totalItems = this.curriculums.length;
      this.cdr.detectChanges();
    }

    this.curriculumService.deleteCurriculum(id).subscribe({
      next: (res) => {
        this.toastService.success('Success', res?.message || 'Curriculum deleted');
        this.loadCurriculums();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error', 'Failed to delete curriculum');
        this.loadCurriculums();
      },
    });
  }

  trackById(index: number, curriculum: CourseCurriculum): number {
    return curriculum.id!;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
