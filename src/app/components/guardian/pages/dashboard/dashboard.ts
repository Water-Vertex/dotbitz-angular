import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guardian-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class GuardianDashboard implements OnInit {
  metrics = {
    customers: 3782,
    customersChange: 11.01,
    customersTrend: 'up',
    orders: 5359,
    ordersChange: 9.05,
    ordersTrend: 'down'
  };

  chartData: any;
  tableData: any[] = [];

  ngOnInit() {
    this.initializeChartData();
    this.initializeTableData();
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
