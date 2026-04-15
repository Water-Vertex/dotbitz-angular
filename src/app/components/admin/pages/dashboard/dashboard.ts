import { Component, OnInit } from '@angular/core';
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
export class Dashboard implements OnInit {
  // Real stats from API
  stats: DashboardStats = {
    total_students: 0,
    total_instructors: 0,
    total_guardians: 0,
    total_assessments_queries: 0
  };

  // UI state
  loading = false;
  error: string | null = null;

  // Additional metrics for UI
  metrics = {
    customers: 3782,
    customersChange: 11.01,
    customersTrend: 'up',
    orders: 5359,
    ordersChange: 9.05,
    ordersTrend: 'down'
  };

  // Computed properties for better display
  get totalRevenue(): number {
    // This could be calculated from assessments queries or another API
    // For now, using a placeholder or calculate from your data
    return this.stats.total_assessments_queries * 25; // Example: $25 per query
  }

  get revenueChange(): number {
    // Calculate based on previous month data (you can implement this)
    return 18.3;
  }

  get studentChange(): number {
    // Calculate based on previous month data (you can implement this)
    return 24.7;
  }

  get activeCourses(): number {
    // This could come from another API endpoint
    return 156;
  }

  chartData: any;
  tableData: any[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.initializeChartData();
    this.initializeTableData();
  }

  loadDashboardStats() {
    this.loading = true;
    this.error = null;

    this.dashboardService.getAdminStats().subscribe({
      next: (response: DashboardResponse) => {
        if (response.success) {
          this.stats = response.data;
          console.log('Dashboard stats loaded:', this.stats);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics. Please try again later.';
        this.loading = false;
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

  initializeChartData() {
    this.chartData = {
      // Chart data configuration
    };
  }

  initializeTableData() {
    this.tableData = [
      {
        product: 'Macbook pro 13”',
        image: 'src/images/product/product-01.jpg',
        category: 'Laptop',
        price: 2399.00,
        status: 'Delivered',
        variants: 2
      },
      // ... more table data
    ];
  }
}
