import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../../services/order.service';

@Component({
  selector: 'app-admin-bill-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './bill-list.html',
})
export class AdminBillList implements OnInit {

  bills: any[]    = [];
  allBills: any[] = [];
  loading = false;

  selectedStatus: string = '';
  searchTerm: string     = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.loading = true;

    this.orderService.getAdminBills().subscribe({
      next: (res: any) => {
        this.allBills = res.data || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.allBills];

    if (this.selectedStatus) {
      filtered = filtered.filter(b => b.status === this.selectedStatus);
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.student_name?.toLowerCase().includes(q) ||
        b.order_number?.toLowerCase().includes(q) ||
        b.student_email?.toLowerCase().includes(q)
      );
    }

    this.bills = filtered;
    this.cdr.detectChanges();
  }

  onSearch(): void { this.applyFilter(); }
  onStatusFilter(): void { this.applyFilter(); }

  viewDetail(orderId: number): void {
    this.router.navigate(['/admin/bills', orderId]);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'canceled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatCurrency(amount: number): string {
    return '$' + Number(amount || 0).toFixed(2);
  }
}