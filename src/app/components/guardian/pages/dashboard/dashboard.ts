import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guardian-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class GuardianDashboardComponent implements OnInit {
  // Metrics cards data
  metrics = {
    children: 2,
    childrenChange: 15.5,
    childrenTrend: 'up',
    courses: 5,
    coursesChange: 5.0,
    coursesTrend: 'up',
    assignments: 3,
    assignmentsChange: -12,
    assignmentsTrend: 'down',
    attendance: 92,
    attendanceChange: 2,
    attendanceTrend: 'up',
  };

  // Chart data placeholder
  chartData: any;

  // Table for children progress
  childrenProgress: any[] = [];

  ngOnInit() {
    this.initializeChartData();
    this.initializeChildrenProgress();
  }

  initializeChartData() {
    this.chartData = {
      // Chart configuration can go here
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Attendance',
          data: [90, 92, 88, 95, 92],
          borderColor: '#3b82f6', // blue-500
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  initializeChildrenProgress() {
    this.childrenProgress = [
      {
        name: 'Ali Khan',
        course: 'Web Development',
        progress: 75,
      },
      {
        name: 'Sara Khan',
        course: 'UI/UX Design',
        progress: 60,
      },
      {
        name: 'Zara Ahmed',
        course: 'Data Science',
        progress: 40,
      },
    ];
  }
}
