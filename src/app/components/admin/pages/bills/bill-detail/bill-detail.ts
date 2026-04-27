import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../../services/order.service';

@Component({
  selector: 'app-admin-bill-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bill-detail.html',
})
export class AdminBillDetail implements OnInit {

  order: any = null;
  loading = false;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.loadDetail(orderId);
  }

  loadDetail(orderId: number): void {
    this.loading = true;

    this.orderService.getAdminBillDetail(orderId).subscribe({
      next: (res: any) => {
        this.order = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        alert('Failed to load order details.');
        this.router.navigate(['/admin/bills']);
      }
    });
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