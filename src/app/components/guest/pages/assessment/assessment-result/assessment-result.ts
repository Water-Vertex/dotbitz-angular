import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';
 
@Component({
  selector: 'app-assessment-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-result.html',
  styleUrl: './assessment-result.css',
})
export class GuestAssessmentResult implements OnInit {
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
 
    this.attemptService.getGuestMyResults().subscribe({
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
        console.error('Error:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
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
      this.filteredResults = this.results.filter(
        (r) =>
          r.course_name?.toLowerCase().includes(term) ||
          r.assessment_title?.toLowerCase().includes(term)
      );
    }
    this.cdr.detectChanges();
  }
 
  trackById(index: number, item: any): number {
    return item.attempt_id;
  }
 
onViewDetail(item: any): void {
  const assignAssessmentId = item.assign_assessment_id;
 
  if (!assignAssessmentId) {
    console.error('Assign Assessment ID missing!');
    return;
  }
 
 
  this.showDetailModal = true;
  this.isDetailLoading = true;  
  this.selectedResult = {
    attempt_id: item.attempt_id,
    assign_assessment_id: item.assign_assessment_id,
    assessment_title: item.assessment_title,
    course_name: item.course_name,
    total_marks: item.total_marks,
    obtain_marks: item.obtain_marks,
    remarks: item.remarks,
    answers: []  // Empty initially
  };
  this.cdr.detectChanges();  
 
 
  this.attemptService.guestViewAttempt(assignAssessmentId).subscribe({
    next: (res: any) => {
      if (res && res.success && res.data) {
        // Update with fresh data
        this.selectedResult = {
          ...this.selectedResult,
          total_marks: res.data.total_marks || item.total_marks,
          obtain_marks: res.data.obtain_marks || item.obtain_marks,
          remarks: res.data.remarks || item.remarks,
          answers: res.data.answers || []
        };
      }
   
      this.isDetailLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('API Error:', err);
     
      this.isDetailLoading = false;
      this.cdr.detectChanges();
    }
  });
}
 
  closeModal(): void {
    this.showDetailModal = false;
    this.selectedResult = null;
    this.cdr.detectChanges();
  }
}