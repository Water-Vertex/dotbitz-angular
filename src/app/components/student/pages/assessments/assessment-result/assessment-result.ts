import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

@Component({
  selector: 'app-student-assessment-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-result.html',
  styleUrls: ['./assessment-result.css'],
})
export class StudentAssessmentResult implements OnInit {
  isLoading = false;
  isDetailLoading = false;
  results: any[] = [];
  filteredResults: any[] = [];
  searchTerm = '';
  showDetailModal = false;
  selectedResult: any = null;

  constructor(
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.attemptService.getMyResults().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.results = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          this.filteredResults = [...this.results];
        } else {
          this.results = [];
          this.filteredResults = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Student API Error:", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  refreshData(): void {
    this.loadResults();
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredResults = [...this.results];
    } else {
      this.filteredResults = this.results.filter(r =>
        r.course_name?.toLowerCase().includes(term) ||
        r.assessment_title?.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  trackById(index: number, item: any): number {
    return item.attempt_id;
  }

  // onViewDetail(item: any): void {
  //   this.selectedResult = { ...item, answers: item.answers || [] };
  //   this.showDetailModal = true;
  //   this.cdr.detectChanges();

  //   if (!item.answers || item.answers.length === 0) {
  //     this.isDetailLoading = true;
  //     this.cdr.detectChanges();

  //     this.attemptService.viewAttempt(item.assign_assessment_id).subscribe({
  //       next: (res: any) => {
  //         if (res.success && res.data) {
  //           this.selectedResult = {
  //             ...this.selectedResult!,
  //             answers: res.data.answers || [],
  //             obtain_marks: res.data.obtain_marks,
  //             total_marks: res.data.total_marks,
  //             remarks: res.data.remarks,
  //             assessment_title: res.data.assessment_title,
  //             course_name: res.data.course_name,
  //           };

  //           const idx = this.results.findIndex(r => r.attempt_id === item.attempt_id);
  //           if (idx !== -1) {
  //             this.results[idx] = { ...this.results[idx], ...this.selectedResult };
  //             this.filteredResults = [...this.results];
  //           }
  //         }
  //         this.isDetailLoading = false;
  //         this.cdr.detectChanges();
  //       },
  //       error: () => {
  //         this.isDetailLoading = false;
  //         this.cdr.detectChanges();
  //       }
  //     });
  //   }
  // }
  onViewDetail(item: any): void {
  this.selectedResult = { ...item, answers: item.answers || [] };
  this.showDetailModal = true;
  this.cdr.detectChanges();

  if (!item.answers || item.answers.length === 0) {
    this.isDetailLoading = true;
    this.cdr.detectChanges();

    this.attemptService.viewAttempt(item.assign_assessment_id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // Calculate Q&A obtained marks
          let obtainedQna = 0;
          let totalQna = 0;
          res.data.answers.forEach((ans: any) => {
            if (ans.assessment_type === 'q-a') {
              totalQna += Number(ans.marks) || 0;
              obtainedQna += parseFloat(ans.is_correct?.toString() || '0');
            }
          });

          this.selectedResult = {
            ...this.selectedResult!,
            answers: res.data.answers || [],
            obtain_marks: res.data.obtain_marks,
            total_marks: res.data.total_marks,
            remarks: res.data.remarks,
            assessment_title: res.data.assessment_title,
            course_name: res.data.course_name,
            obtained_qna_marks: obtainedQna,
            total_qna_marks: totalQna
          };

          const idx = this.results.findIndex(r => r.attempt_id === item.attempt_id);
          if (idx !== -1) {
            this.results[idx] = { ...this.results[idx], ...this.selectedResult };
            this.filteredResults = [...this.results];
          }
        }
        this.isDetailLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDetailLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedResult = null;
    this.cdr.detectChanges();
  }

  // Stats Helper Methods
  getAverageScore(): number {
    const graded = this.filteredResults.filter(r => r.obtain_marks !== null && r.total_marks);
    if (graded.length === 0) return 0;
    const total = graded.reduce((sum, r) => sum + (r.obtain_marks / r.total_marks) * 100, 0);
    return Math.round(total / graded.length);
  }

  getPassedCount(): number {
    return this.filteredResults.filter(r =>
      r.obtain_marks !== null && r.obtain_marks >= (r.total_marks * 0.6)
    ).length;
  }

  getTopScore(): number {
    const scores = this.filteredResults
      .filter(r => r.obtain_marks !== null && r.total_marks)
      .map(r => (r.obtain_marks / r.total_marks) * 100);
    if (scores.length === 0) return 0;
    return Math.round(Math.max(...scores));
  }

  // Helper methods for colors and formatting
  getScoreColorClass(obtained: number, total: number): string {
    if (obtained === null || obtained === undefined) return 'bg-gray-100 text-gray-500';
    const percentage = (obtained / total) * 100;
    if (percentage >= 60) return 'bg-green-100 text-green-700';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }

  getStatusText(obtained: number, total: number): string {
    if (obtained === null || obtained === undefined) return 'Not Graded';
    const percentage = (obtained / total) * 100;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
  }

  formatOptions(options: any): string[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch {
        return options.split(',').map((opt: string) => opt.trim());
      }
    }
    return [];
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
  getAnswerObtainedMarks(ans: any): number {
  if (ans.assessment_type === 'mcqs') {
    return ans.is_correct == 1 ? Number(ans.marks) : 0;
  } else {
    return parseFloat(ans.is_correct?.toString() || '0');
  }
}
}
