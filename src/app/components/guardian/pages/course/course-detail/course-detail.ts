import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-guardian-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.html',
 
})
export class CourseDetailComponent implements OnInit {
  course: any = null;
  id!: string;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Subscribe to paramMap to handle route changes within the same component
    this.route.paramMap.subscribe((params) => {
      const newId = params.get('id');
      if (newId) {
        this.id = newId;
        this.getCourseDetail();
      }
    });
  }

  getCourseDetail() {
    this.loading = true;
    this.course = null;

    // USE THE GUARDIAN API CALL HERE
    this.courseService.getGuardianCourseDetail(+this.id).subscribe({
      next: (res: any) => {
        this.course = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Guardian Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getBenefits(): string[] {
    if (!this.course?.benefits) return [];
    // Handles both string and array formats if your API varies
    return typeof this.course.benefits === 'string'
      ? this.course.benefits.split(',')
      : this.course.benefits;
  }
}
