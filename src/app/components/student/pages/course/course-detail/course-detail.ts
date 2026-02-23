import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-student-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css'],
})
export class StudentCourseDetail implements OnInit {
  course: any = null;
  relatedCourses: any[] = [];
  id!: string;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef, // Change Detection force karne ke liye
  ) {}

  ngOnInit(): void {
    // 1. Snapshot ke bajaye paramMap ko subscribe karein
    // Isse sidebar par har click par ye function chalega
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
    this.course = null; // Purana data clear karein taaki screen blink na kare

    this.courseService.getStudentCourseDetail(+this.id).subscribe({
      next: (res: any) => {
        this.course = res.data || res.course;
        this.relatedCourses = res.relatedCourses || [];
        this.loading = false;

        // UI ko foran update karne ke liye
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Course detail error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getBenefits(): string[] {
    return this.course?.benefits ? this.course.benefits.split(',') : [];
  }
}
