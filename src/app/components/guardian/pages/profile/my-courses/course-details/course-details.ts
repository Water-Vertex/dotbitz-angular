import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../../services/course.service';
import { AssignmentService } from '../../../../../../services/assignment.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-details.html',
})
export class GuardianCourseDetails implements OnInit {
  course: any = null;
  id!: string;
  loading = false;

  activeTab: 'instructor' | 'curriculum' | 'assignment' | 'quiz' = 'instructor';

  assignments: any[] = [];
  assignmentsLoading = false;
  assignmentsLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // always start on instructor
    this.activeTab = 'instructor';

    this.route.paramMap.subscribe((params) => {
      const newId = params.get('id');
      if (newId) {
        this.id = newId;
        this.getCourseDetail();

        const currentTab = this.route.snapshot.queryParams['tab'];
        if (currentTab === 'assignment') {
          this.activeTab = 'assignment';
        }
      }
    });

    this.route.queryParams.subscribe((params) => {
      const newTab = params['tab'];
      if (newTab) {
        this.activeTab = newTab;
        if (this.activeTab === 'assignment' && this.id && !this.assignmentsLoaded) {
          this.loadAssignments();
        }
        this.cdr.detectChanges();
      }
    });
  }

  getCourseDetail() {
    this.loading = true;
    this.assignmentsLoaded = false; // ← reset on course change
    this.assignments = []; // ← clear old assignments
    this.courseService.getGuardianCourseDetail(+this.id).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.loading = false;
        if (this.activeTab === 'assignment') {
          this.loadAssignments(); // ← load if already on assignment tab
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setTab(tab: 'instructor' | 'curriculum' | 'assignment' | 'quiz') {
    this.activeTab = tab;
    localStorage.setItem('guardianTab', tab);
    if (tab === 'assignment' && !this.assignmentsLoaded) {
      this.loadAssignments();
    }
  }

  loadAssignments() {
    this.assignmentsLoading = true;
    this.assignmentService.getAssignmentsGuardian(+this.id).subscribe({
      next: (res: any) => {
        console.log('Assignments raw response:', res);
        this.assignments = res.data || [];
        this.assignmentsLoaded = true;
        this.assignmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Assignments error:', err);
        this.assignmentsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  isOverdue(dueDate: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }
}
