import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { McqService } from '../../../../../services/mcq.service';
import { Mcq } from '../../../../../models/mcq.model';
import { Course } from '../../../../../models/course.model';
import { ToastService } from '../../../../../services/toast.service';

interface McqGroup {
  courseId: number;
  courseName: string;
  mcqs: Mcq[];
}

@Component({
  selector: 'app-instructor-mcqs-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mcq-list.html',
  styleUrls: ['./mcq-list.css']
})
export class InstructorMcqsList implements OnInit {
  mcqs: Mcq[] = [];
  filteredMcqs: Mcq[] = [];
  groupedMcqs: McqGroup[] = [];
  courses: Course[] = [];
  selectedCourseId: number | string = 'all';
  searchText = '';
  loading = true;
  expandedCourses: Set<number> = new Set();

  // ✅ Add these two flags
  private coursesLoaded = false;
  private mcqsLoaded = false;

  constructor(
    private mcqService: McqService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadMcqs();
  }

  // ✅ Load courses and normalize names
  loadCourses(): void {
    this.mcqService.getInstructorCourses().subscribe({
      next: (data: any) => {
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        this.courses = all
          .filter((c: any) => c.status === 'active')
          .map((c: any) => {
            // Ensure id is always a number
            const id = Number(c.id) || 0;
            return {
              id: id,
              course_name: c.course_name || c.name || c.title || `Course #${id}`,
              course_code: c.course_code || c.code || ''
            } as Course;
          });
        this.coursesLoaded = true;
        this.tryApplyFilters();
      },
      error: () => {
        this.courses = [];
        this.coursesLoaded = true;
        this.tryApplyFilters();
      }
    });
  }

  // ✅ Load MCQs
  loadMcqs(): void {
    this.loading = true;
    this.mcqService.getInstructorMcqs().subscribe({
      next: (data: any) => {
        this.mcqs = Array.isArray(data) ? data : (data?.data ?? []);
        this.mcqsLoaded = true;
        this.tryApplyFilters();
      },
      error: (err) => {
        console.error('Error loading MCQs:', err);
        this.mcqs = [];
        this.mcqsLoaded = true;
        this.tryApplyFilters();
        this.toastService.error('Error', 'Failed to load MCQs');
      }
    });
  }

  // ✅ Helper to apply filters only after both loads finish
  private tryApplyFilters(): void {
    if (this.coursesLoaded && this.mcqsLoaded) {
      this.loading = false;
      this.applyFilters();
      this.cdr.detectChanges();
    }
  }

  // ✅ Apply filters (course & search)
  applyFilters(): void {
    let result = [...this.mcqs];

    if (this.selectedCourseId !== 'all') {
      result = result.filter(mcq => mcq.course_id === Number(this.selectedCourseId));
    }

    if (this.searchText.trim()) {
      const search = this.searchText.trim().toLowerCase();
      result = result.filter(mcq =>
        mcq.question?.toLowerCase().includes(search) ||
        (mcq as any).course?.course_name?.toLowerCase().includes(search) ||
        mcq.status?.toLowerCase().includes(search)
      );
    }

    this.filteredMcqs = result;
    this.groupMcqsByCourse();
    this.cdr.detectChanges();
  }

  // ✅ Group MCQs by course using course name map
  groupMcqsByCourse(): void {
    const courseNameMap = new Map<number, string>();
    this.courses.forEach(c => {
      if (c.id !== undefined) {
        courseNameMap.set(c.id, c.course_name || `Course #${c.id}`);
      }
    });

    const groups = new Map<number, McqGroup>();
    this.filteredMcqs.forEach(mcq => {
      const courseId = mcq.course_id;
      const courseName = courseNameMap.get(courseId) || `Course #${courseId}`;
      if (!groups.has(courseId)) {
        groups.set(courseId, {
          courseId: courseId,
          courseName: courseName,
          mcqs: []
        });
      }
      groups.get(courseId)!.mcqs.push(mcq);
    });

    this.groupedMcqs = Array.from(groups.values()).sort((a, b) =>
      a.courseName.localeCompare(b.courseName)
    );

    // Auto-expand first group if nothing is expanded
    if (this.groupedMcqs.length > 0 && this.expandedCourses.size === 0) {
      this.expandedCourses.add(this.groupedMcqs[0].courseId);
    }
  }

  getOptionsArray(options: any): any[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try { return JSON.parse(options); } catch { return []; }
    }
    return [];
  }

  toggleCourse(index: number): void {
    const courseId = this.groupedMcqs[index].courseId;
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
    this.cdr.detectChanges();
  }

  isExpanded(index: number): boolean {
    return this.expandedCourses.has(this.groupedMcqs[index].courseId);
  }

  onCourseChange(): void { this.applyFilters(); }
  onSearch(): void { this.applyFilters(); }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCourseId = 'all';
    this.applyFilters();
  }

  refreshData(): void {
    this.loadCourses();
    this.loadMcqs();
  }

  deleteMcq(id: number): void {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;
    this.mcqService.deleteInstructorMcq(id).subscribe({
      next: () => {
        this.toastService.success('Success', 'MCQ deleted successfully');
        this.loadMcqs();
      },
      error: () => this.toastService.error('Error', 'Failed to delete MCQ')
    });
  }

  trackById(index: number, item: Mcq): number {
    return item.id!;
  }
}