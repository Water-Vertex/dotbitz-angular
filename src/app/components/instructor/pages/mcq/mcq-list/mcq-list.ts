import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { McqService } from '../../../../../services/mcq.service';

@Component({
  selector: 'app-instructor-mcq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mcq-list.html',
})
export class InstructorMcqsList implements OnInit {

  mcqs: any[] = [];
  loading = false;
  deleting: number | null = null;
  selectedCourseId: number | null = null;
  courses: any[] = [];
  allMcqs: any[] = []; 

  constructor(
    private mcqService: McqService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMcqs();
  }

  loadMcqs(): void {
  this.loading = true;
  this.mcqService.getInstructorMcqs().subscribe({
    next: (res: any) => {
      this.allMcqs = res.data || [];
      this.mcqs = [...this.allMcqs];

      // 🔥 Unique courses extract karo
      const uniqueCoursesMap = new Map();

      this.allMcqs.forEach((m: any) => {
        if (m.course) {
          uniqueCoursesMap.set(m.course.id, m.course);
        }
      });

      this.courses = Array.from(uniqueCoursesMap.values());

      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loading = false;
    }
  });
}
filterByCourse() {
  if (!this.selectedCourseId) {
    this.mcqs = [...this.allMcqs];
  } else {
    this.mcqs = this.allMcqs.filter(
      m => m.course_id === this.selectedCourseId
    );
  }
}

  onEdit(id: number): void {
    this.router.navigate(['/instructor/mcqs/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;

    this.deleting = id;
    this.mcqService.deleteInstructorMcq(id).subscribe({
      next: () => {
        this.deleting = null;
        this.mcqs = this.mcqs.filter(m => m.msq_id !== id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.deleting = null;
        alert('Failed to delete MCQ.');
      }
    });
  }
}