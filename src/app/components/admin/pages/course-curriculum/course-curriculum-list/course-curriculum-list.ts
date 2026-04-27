// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink, NavigationEnd } from '@angular/router';
// import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
// import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
// import { ToastService } from '../../../../../services/toast.service';
// import { CourseCurriculum } from '../../../../../models/coursecurriculum.model';

// @Component({
//   selector: 'app-course-curriculum-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './course-curriculum-list.html',
// })
// export class CourseCurriculumList implements OnInit, OnDestroy {
//   curriculums: CourseCurriculum[] = [];
//   totalItems: number = 0;
//   searchTerm: string = '';
//   isLoading: boolean = false;

//   private searchSubject = new Subject<string>();
//   private destroy$ = new Subject<void>();

//   constructor(
//     private curriculumService: CourseCurriculumService,
//     private toastService: ToastService,
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//   ) {
//     this.router.events
//       .pipe(
//         filter((event) => event instanceof NavigationEnd),
//         takeUntil(this.destroy$),
//       )
//       .subscribe((event: any) => {
//         if (event.url.includes('/admin/course-curriculum')) {
//           this.loadCurriculums();
//         }
//       });
//   }

//   ngOnInit(): void {
//     this.loadCurriculums();

//     this.searchSubject
//       .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.loadCurriculums();
//       });
//   }

//   loadCurriculums(): void {
//     this.isLoading = true;
//     this.cdr.detectChanges();

//     this.curriculumService
//       .getCurriculums()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (res) => {
//           const data = Array.isArray(res.data) ? res.data : [res.data];
//           this.curriculums = data.filter(
//             (c) =>
//               !this.searchTerm || c.title.toLowerCase().includes(this.searchTerm.toLowerCase()),
//           );
//           this.totalItems = this.curriculums.length;
//           this.isLoading = false;
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error(err);
//           this.toastService.error('Error', 'Failed to load curriculums');
//           this.isLoading = false;
//         },
//       });
//   }

//   refreshData(): void {
//     this.loadCurriculums();
//   }

//   onSearch(): void {
//     this.searchSubject.next(this.searchTerm);
//   }

//   editCurriculum(id: number): void {
//     this.router.navigate(['/admin/course-curriculum/edit', id]);
//   }

//   deleteCurriculum(id: number): void {
//     if (!confirm('Are you sure you want to delete this curriculum?')) return;

//     // Optimistic UI remove
//     const index = this.curriculums.findIndex((c) => c.id === id);
//     if (index !== -1) {
//       this.curriculums.splice(index, 1);
//       this.totalItems = this.curriculums.length;
//       this.cdr.detectChanges();
//     }

//     this.curriculumService.deleteCurriculum(id).subscribe({
//       next: (res) => {
//         this.toastService.success('Success', res?.message || 'Curriculum deleted');
//         this.loadCurriculums();
//       },
//       error: (err) => {
//         console.error(err);
//         this.toastService.error('Error', 'Failed to delete curriculum');
//         this.loadCurriculums();
//       },
//     });
//   }

//   trackById(index: number, curriculum: CourseCurriculum): number {
//     return curriculum.id!;
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }
// // }
// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterLink, NavigationEnd } from '@angular/router';
// import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
// import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
// import { ToastService } from '../../../../../services/toast.service';
// import { CourseCurriculum, Course } from '../../../../../models/coursecurriculum.model';

// @Component({
//   selector: 'app-course-curriculum-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './course-curriculum-list.html',
// })
// export class CourseCurriculumList implements OnInit, OnDestroy {
//   curriculums: CourseCurriculum[] = [];
//   allCurriculums: CourseCurriculum[] = []; // Backup for filtering
//   courses: Course[] = []; // Drop-down ke liye
//   totalItems: number = 0;
//   searchTerm: string = '';
//   selectedCourseId: string = ''; // Filter value
//   isLoading: boolean = false;

//   private searchSubject = new Subject<string>();
//   private destroy$ = new Subject<void>();

//   constructor(
//     private curriculumService: CourseCurriculumService,
//     private toastService: ToastService,
//     private router: Router,
//     private cdr: ChangeDetectorRef,
//   ) {
//     this.router.events
//       .pipe(
//         filter((event) => event instanceof NavigationEnd),
//         takeUntil(this.destroy$),
//       )
//       .subscribe((event: any) => {
//         if (event.url.includes('/admin/course/curriculum')) {
//           this.loadCurriculums();
//         }
//       });
//   }

//   ngOnInit(): void {
//     this.loadCourses(); // Courses load karein
//     this.loadCurriculums();

//     this.searchSubject
//       .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.applyFilters();
//       });
//   }

//   loadCourses(): void {
//     this.curriculumService.getCourses().subscribe({
//       next: (res: any) => {
//         this.courses = res.data || res || [];
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   loadCurriculums(): void {
//     this.isLoading = true;
//     this.cdr.detectChanges();

//     this.curriculumService
//       .getCurriculums()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (res) => {
//           this.allCurriculums = Array.isArray(res.data) ? res.data : [res.data];
//           this.applyFilters(); // Filter apply karein
//           this.isLoading = false;
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           this.toastService.error('Error', 'Failed to load curriculums');
//           this.isLoading = false;
//         },
//       });
//   }

//   // Naya function jo Search aur Dropdown dono ko handle karega
//   // applyFilters(): void {
//   //   this.curriculums = this.allCurriculums.filter((c) => {
//   //     const matchesSearch = !this.searchTerm || c.title.toLowerCase().includes(this.searchTerm.toLowerCase());
//   //     const matchesCourse = !this.selectedCourseId || c.course_id?.toString() === this.selectedCourseId;
//   //     return matchesSearch && matchesCourse;
//   //   });
//   //   this.totalItems = this.curriculums.length;
//   //   this.cdr.detectChanges();
//   // }


//   applyFilters(): void {
//   let filtered = this.allCurriculums.filter((c) => {
//     const matchesSearch = !this.searchTerm || c.title.toLowerCase().includes(this.searchTerm.toLowerCase());
//     const matchesCourse = !this.selectedCourseId || c.course_id?.toString() === this.selectedCourseId;
//     return matchesSearch && matchesCourse;
//   });

//   // SORTING LOGIC: Pehle Course ke naam se, phir Duration (Week) ke hisaab se
//   this.curriculums = filtered.sort((a, b) => {
//     // 1. Pehle Course Name ke hisaab se sort karein (Group by Course)
//     const courseA = a.course?.course_name?.toLowerCase() || '';
//     const courseB = b.course?.course_name?.toLowerCase() || '';
    
//     if (courseA < courseB) return -1;
//     if (courseA > courseB) return 1;

//     // 2. Agar course same hai, toh Duration (Week) ke hisaab se sequence set karein
//     const durationA = Number(a.duration) || 0;
//     const durationB = Number(b.duration) || 0;
//     return durationA - durationB;
//   });

//   this.totalItems = this.curriculums.length;
//   this.cdr.detectChanges();
// }

//   onFilterChange(): void {
//     this.applyFilters();
//   }

//   refreshData(): void {
//     this.searchTerm = '';
//     this.selectedCourseId = '';
//     this.loadCurriculums();
//   }

//   onSearch(): void {
//     this.searchSubject.next(this.searchTerm);
//   }

//   // ... baaki delete aur trackById functions wahi rahenge
//   deleteCurriculum(id: number): void {
//     if (!confirm('Are you sure you want to delete this curriculum?')) return;
//     this.curriculumService.deleteCurriculum(id).subscribe({
//       next: () => {
//         this.toastService.success('Success', 'Curriculum deleted');
//         this.loadCurriculums();
//       },
//       error: () => this.toastService.error('Error', 'Delete failed')
//     });
//   }

//   trackById(index: number, curriculum: CourseCurriculum): number {
//     return curriculum.id!;
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
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { CourseCurriculum, Course } from '../../../../../models/coursecurriculum.model';

@Component({
  selector: 'app-course-curriculum-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-curriculum-list.html',
})
export class CourseCurriculumList implements OnInit, OnDestroy {
  curriculums: CourseCurriculum[] = [];
  allCurriculums: CourseCurriculum[] = []; 
  courses: Course[] = []; 
  totalItems: number = 0;
  searchTerm: string = '';
  selectedCourseId: string = ''; 
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
        if (event.url.includes('/admin/course/curriculum')) {
          this.loadCurriculums();
        }
      });
  }

  ngOnInit(): void {
    this.loadCourses(); 
    this.loadCurriculums();

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(), 
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  loadCourses(): void {
    this.curriculumService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || res || [];
        this.cdr.detectChanges();
      }
    });
  }

  loadCurriculums(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.curriculumService
      .getCurriculums()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => { // Yahan 'any' rakhein taaki response structure handle ho sake
          // FIX: Data extraction aur type casting
          const rawData = res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : (Array.isArray(res) ? res : []);
          this.allCurriculums = rawData as CourseCurriculum[];
          
          this.applyFilters(); 
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastService.error('Error', 'Failed to load curriculums');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  applyFilters(): void {
    if (!this.allCurriculums) return;

    let filtered = this.allCurriculums.filter((c) => {
      const matchesSearch = !this.searchTerm.trim() || 
        c.title.toLowerCase().includes(this.searchTerm.toLowerCase().trim());
      
      const matchesCourse = !this.selectedCourseId || 
        c.course_id?.toString() === this.selectedCourseId.toString();

      return matchesSearch && matchesCourse;
    });

    // SORTING: Pehle Course Name phir Duration (Week)
    this.curriculums = filtered.sort((a, b) => {
      const courseA = a.course?.course_name?.toLowerCase() || '';
      const courseB = b.course?.course_name?.toLowerCase() || '';
      
      if (courseA !== courseB) {
        return courseA.localeCompare(courseB);
      }

      const durationA = Number(a.duration) || 0;
      const durationB = Number(b.duration) || 0;
      return durationA - durationB;
    });

    this.totalItems = this.curriculums.length;
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.applyFilters();
    } else {
      this.searchSubject.next(this.searchTerm);
    }
  }

  refreshData(): void {
    this.searchTerm = '';
    this.selectedCourseId = '';
    this.loadCurriculums();
  }

  deleteCurriculum(id: number): void {
    if (!confirm('Are you sure you want to delete this curriculum?')) return;
    
    this.curriculumService.deleteCurriculum(id).subscribe({
      next: () => {
        this.toastService.success('Success', 'Curriculum deleted');
        this.loadCurriculums();
      },
      error: () => {
        this.toastService.error('Error', 'Delete failed');
      }
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