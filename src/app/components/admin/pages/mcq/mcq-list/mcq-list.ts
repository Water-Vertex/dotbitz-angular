

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { McqService } from '../../../../../services/mcq.service';
import { Mcq } from '../../../../../models/mcq.model';
import { Course } from '../../../../../models/course.model';

@Component({
  selector: 'app-mcq-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mcq-list.html',

  styleUrls: ['./mcq-list.css']
})
export class McqsList implements OnInit {

  mcqs: Mcq[] = [];
  filteredMcqs: Mcq[] = [];
  courses: Course[] = [];
  selectedCourseId: number | 'all' = 'all';
  searchText = '';
  loading = true;

  constructor(
    private mcqService: McqService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 MCQ List Component Initialized');
    this.loadMcqs();
    this.loadCourses(); // 🔥 NEW

  }

  loadCourses(): void {
  this.mcqService.getAllCourses().subscribe({
    next: (data) => {
      this.courses = data;
    },
    error: () => {
      this.courses = [];
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
        this.filteredMcqs = [...this.mcqs]; // 🔥 IMPORTANT

        console.log('📊 Total MCQs:', this.mcqs.length);
      },
      error: (err) => {
        console.error('❌ Error loading MCQs:', err);
        this.mcqs = [];
        this.filteredMcqs = [];
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges(); // 🔥 THIS FIXES UI FREEZE
        console.log('🏁 MCQ loading completed');
      }
    });
  }

  onCourseChange(): void {
  if (!this.selectedCourseId) {
    // All courses
    this.filteredMcqs = [...this.mcqs];
    return;
  }

  this.filteredMcqs = this.mcqs.filter(
    mcq => mcq.course_id === Number(this.selectedCourseId)
  );
}

  get groupedMcqs() {
  const groups: { courseName: string, mcqs: Mcq[] }[] = [];
  const map = new Map<string, Mcq[]>();

  for (const mcq of this.filteredMcqs) {
    const courseName = mcq.course?.course_name || 'No Course';
    if (!map.has(courseName)) map.set(courseName, []);
    map.get(courseName)!.push(mcq);
  }

  for (const [courseName, mcqs] of map.entries()) {
    groups.push({ courseName, mcqs });
  }

  return groups;
}


  // onSearch(): void {
  //   const search = this.searchText.trim().toLowerCase();

  //   if (!search) {
  //     this.filteredMcqs = [...this.mcqs];
  //     return;
  //   }

  //   this.filteredMcqs = this.mcqs.filter(mcq =>
  //     mcq.question?.toLowerCase().includes(search) ||
  //     mcq.course?.course_name?.toLowerCase().includes(search) ||
  //     mcq.status?.toLowerCase().includes(search)
  //   );
  // }
  onSearch(): void {
  const search = this.searchText.trim().toLowerCase();

  let baseList = this.mcqs;

  if (this.selectedCourseId) {
    baseList = baseList.filter(
      mcq => mcq.course_id === Number(this.selectedCourseId)
    );
  }

  if (!search) {
    this.filteredMcqs = [...baseList];
    return;
  }

  this.filteredMcqs = baseList.filter(mcq =>
    mcq.question?.toLowerCase().includes(search) ||
    mcq.status?.toLowerCase().includes(search)
  );
}


  deleteMcq(id: number): void {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;

    this.mcqService.deleteMcq(id).subscribe({
      next: () => this.loadMcqs(),
      error: () => alert('Failed to delete MCQ')
    });
  }

  trackById(index: number, item: Mcq): number {
    return item.msq_id!;
  }
}
