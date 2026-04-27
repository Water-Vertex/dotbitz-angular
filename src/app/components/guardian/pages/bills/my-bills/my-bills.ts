import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../../../services/order.service';

@Component({
  selector: 'app-guardian-my-bills',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bills.html',
})
export class GuardianMyBills implements OnInit {

  bills: any[] = [];
  loading = false;
  selectedOrder: any = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBills();
  }

  loadBills(): void {
    this.loading = true;

    this.orderService.getGuardianBills().subscribe({
      next: (res: any) => {
        this.bills = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewDetail(bill: any): void {
    this.selectedOrder = bill;
  }

  closeDetail(): void {
    this.selectedOrder = null;
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