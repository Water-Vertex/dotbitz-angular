import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { McqService } from '../../../../../services/mcq.service';
import { Mcq } from '../../../../../models/mcq.model';
import { Course } from '../../../../../models/course.model';
import { AuthService } from '../../../../../services/auth.service';

interface McqGroup {
  courseId: number;
  courseName: string;
  mcqs: Mcq[];
}

@Component({
  selector: 'app-mcqs-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mcq-list.html',
  styleUrls: ['./mcq-list.css']
})
export class McqsList implements OnInit {
  mcqs: Mcq[] = [];
  filteredMcqs: Mcq[] = [];
  groupedMcqs: McqGroup[] = [];
  courses: Course[] = [];
  selectedCourseId: number | string = 'all';
  searchText = '';
  loading = true;

  // Accordion state - track which courses are expanded
  expandedCourses: Set<number> = new Set();

  constructor(
    private mcqService: McqService,
    private cdr: ChangeDetectorRef,
     public auth: AuthService, 
  ) {}

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  ngOnInit(): void {
    console.log('🚀 MCQ List Component Initialized');
    this.loadMcqs();
    this.loadCourses();
  }

  loadCourses(): void {
    this.mcqService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.courses = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadMcqs(): void {
    console.log('📥 Loading MCQs from API...');
    this.loading = true;

    this.mcqService.getAllMcqs().subscribe({
      next: (data: Mcq[]) => {
        console.log('✅ MCQs received:', data);
        this.mcqs = Array.isArray(data) ? data : [];
        this.applyFilters();
      },
      error: (err) => {
        console.error('❌ Error loading MCQs:', err);
        this.mcqs = [];
        this.filteredMcqs = [];
        this.groupedMcqs = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log('🏁 MCQ loading completed');
      }
    });
  }

  applyFilters(): void {
    let result = [...this.mcqs];

    // Apply course filter
    if (this.selectedCourseId !== 'all') {
      result = result.filter(mcq => mcq.course_id === Number(this.selectedCourseId));
    }

    // Apply search filter
    if (this.searchText.trim()) {
      const search = this.searchText.trim().toLowerCase();
      result = result.filter(mcq =>
        mcq.question?.toLowerCase().includes(search) ||
        mcq.course?.course_name?.toLowerCase().includes(search) ||
        mcq.status?.toLowerCase().includes(search)
      );
    }

    this.filteredMcqs = result;
    this.groupMcqsByCourse();
    this.cdr.detectChanges();
    console.log(`Filtered: ${this.filteredMcqs.length} / ${this.mcqs.length} MCQs`);
  }

  groupMcqsByCourse(): void {
    const groups = new Map<number, McqGroup>();

    this.filteredMcqs.forEach(mcq => {
      const courseId = mcq.course_id;
      const courseName = mcq.course?.course_name || `Course #${courseId}`;

      if (!groups.has(courseId)) {
        groups.set(courseId, {
          courseId: courseId,
          courseName: courseName,
          mcqs: []
        });
      }
      groups.get(courseId)!.mcqs.push(mcq);
    });

    // Convert to array and sort by course name
    this.groupedMcqs = Array.from(groups.values()).sort((a, b) =>
      a.courseName.localeCompare(b.courseName)
    );

    // Auto-expand first course by default if there are any
    if (this.groupedMcqs.length > 0 && this.expandedCourses.size === 0) {
      this.expandedCourses.add(this.groupedMcqs[0].courseId);
    }
  }

  getOptionsArray(options: any): any[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch {
        return [];
      }
    }
    return [];
  }

  // Toggle accordion for a specific course
  toggleCourse(index: number): void {
    const courseId = this.groupedMcqs[index].courseId;
    if (this.expandedCourses.has(courseId)) {
      this.expandedCourses.delete(courseId);
    } else {
      this.expandedCourses.add(courseId);
    }
    this.cdr.detectChanges();
  }

  // Check if a course is expanded
  isExpanded(index: number): boolean {
    return this.expandedCourses.has(this.groupedMcqs[index].courseId);
  }

  onCourseChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCourseId = 'all';
    this.applyFilters();
  }

  deleteMcq(id: number): void {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;

    this.mcqService.deleteMcq(id).subscribe({
      next: () => {
        this.loadMcqs();
        alert('MCQ deleted successfully!');
      },
      error: () => alert('Failed to delete MCQ')
    });
  }

  trackById(index: number, item: Mcq): number {
    return item.id!;
  }
}
