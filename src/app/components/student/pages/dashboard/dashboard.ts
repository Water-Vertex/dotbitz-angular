import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../../services/dashboard.service';
import { DashboardStats, DashboardResponse } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class StudentDashboard implements OnInit {
  // Real stats from API
  stats: DashboardStats = {
    total_courses: 0,
    total_assessments: 0,
    total_assignments: 0,
    completed_courses: 0,
    in_progress_courses: 0,
    completed_assessments: 0,
    pending_assessments: 0,
    submitted_assignments: 0,
    pending_assignments: 0,
    average_completion_rate: 0,
    total_students: 0,
    total_instructors: 0,
    total_guardians: 0,
    total_assessments_queries: 0,
    total_quizzes: 0,
    total_batches: 0,
  };

  // UI state
  loading = false;
  error: string | null = null;
  studentName: string = '';

  // Computed properties for better display
  get totalRevenue(): number {
    return this.stats.total_assessments * 25; // Example: $25 per assessment
  }

  get revenueChange(): number {
    return 18.3;
  }

  get studentChange(): number {
    return 24.7;
  }

  get overallProgress(): number {
    return this.stats.average_completion_rate;
  }

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.getStudentName();
  }

  getStudentName() {
    // You can get this from your auth service
    this.studentName = localStorage.getItem('student_name') || 'Student';
  }

  loadDashboardStats() {
    this.loading = true;
    this.error = null;

    this.dashboardService.getStudentStats().subscribe({
      next: (response: DashboardResponse) => {
        if (response.success) {
          this.stats = response.data;
          console.log('Student dashboard stats loaded:', this.stats);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading dashboard stats:', err);
      }
    });
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-red-600';
  }
}
