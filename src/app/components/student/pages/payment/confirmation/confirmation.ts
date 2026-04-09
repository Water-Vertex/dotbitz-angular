import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../../../services/order.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.css']
})
export class Confirmation implements OnInit {
  loading = true;
  paymentVerified = false;
  errorMessage = '';
  orderNumber = '';
  amountPaid: number = 0;
  paymentDate = new Date();
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const orderId = this.route.snapshot.queryParamMap.get('order_id');

    if (sessionId && orderId) {
      this.orderId = parseInt(orderId, 10);
      this.verifyPayment(sessionId, this.orderId);
    } else {
      this.loading = false;
      this.errorMessage = 'Invalid payment response. Please contact support.';
    }
  }

  verifyPayment(sessionId: string, orderId: number): void {
    this.orderService.verifyPayment(sessionId, orderId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.paymentVerified = true;
          this.orderNumber = res.data.order?.order_number || '';
          this.amountPaid = res.data.order?.total_amount || 0;
          this.paymentDate = res.data.order?.paid_at ? new Date(res.data.order.paid_at) : new Date();
          localStorage.setItem('payment_success', 'true');
        } else {
          this.errorMessage = res.message || 'Payment verification failed. Please contact support.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to verify payment. Please contact support.';
        console.error('Payment verification error:', err);
      }
    });
  }

  goToCourses(): void {
    this.router.navigate(['/student/courses/list']);
  }

  viewOrderDetails(): void {
    if (this.orderId) {
      this.router.navigate(['/student/orders', this.orderId]);
    } else {
      this.goToCourses();
    }
  }

  downloadInvoice(): void {
    if (this.orderId) {
      this.orderService.downloadInvoice(this.orderId);
    }
  }

  contactSupport(): void {
    this.router.navigate(['/student/support']);
  }
}
