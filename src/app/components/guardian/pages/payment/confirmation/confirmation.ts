import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../../services/order.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.css']
})
export class GuardianConfirmation implements OnInit {
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
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get query parameters
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    const orderIdParam = this.route.snapshot.queryParamMap.get('order_id');
    
    console.log('Session ID:', sessionId);
    console.log('Order ID Param:', orderIdParam);

    // We need both session_id and order_id for verification
    if (sessionId && orderIdParam) {
      this.orderId = parseInt(orderIdParam, 10);
      this.verifyPayment(sessionId, this.orderId);
    } else if (orderIdParam) {
      // If only order_id is available, check order status
      this.orderId = parseInt(orderIdParam, 10);
      this.checkOrderStatus(this.orderId);
    } else {
      this.loading = false;
      this.errorMessage = 'Invalid payment response. Please contact support.';
      this.cdr.detectChanges();
    }
  }

  verifyPayment(sessionId: string, orderId: number): void {
    console.log('Verifying payment with sessionId:', sessionId, 'orderId:', orderId);
    
    this.orderService.verifyPayment(sessionId, orderId).subscribe({
      next: (res: any) => {
        console.log('Payment verification response:', res);
        
        // IMPORTANT: Set loading to false FIRST
        this.loading = false;
        
        if (res.success) {
          this.paymentVerified = true;
          
          // Access data from response - based on your response structure
          const orderData = res.data?.order || res.data;
          
          this.orderNumber = orderData?.order_number || 'N/A';
          this.amountPaid = parseFloat(orderData?.total_amount || 0);
          this.orderId = orderData?.id || orderId;
          
          // Format payment date
          if (orderData?.paid_at) {
            this.paymentDate = new Date(orderData.paid_at);
          } else if (orderData?.updated_at) {
            this.paymentDate = new Date(orderData.updated_at);
          }
          
          // Store success in localStorage
          localStorage.setItem('payment_success', 'true');
          localStorage.setItem('last_order_id', this.orderId?.toString() || '');
          
          console.log('Payment verified successfully!');
        } else {
          this.errorMessage = res.message || 'Payment verification failed. Please contact support.';
          console.error('Payment verification failed:', res.message);
        }
        
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Payment verification error:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to verify payment. Please contact support.';
        this.cdr.detectChanges();
      }
    });
  }

  checkOrderStatus(orderId: number): void {
    console.log('Checking order status for orderId:', orderId);
    
    this.orderService.getOrder(orderId).subscribe({
      next: (res: any) => {
        console.log('Order details response:', res);
        
        // IMPORTANT: Set loading to false FIRST
        this.loading = false;
        
        if (res.success && res.data) {
          const order = res.data;
          
          // Check if payment was successful
          if (order.payment_status === 'succeeded' || order.status === 'paid') {
            this.paymentVerified = true;
            this.orderNumber = order.order_number;
            this.amountPaid = parseFloat(order.total_amount);
            this.orderId = order.id;
            this.paymentDate = order.paid_at ? new Date(order.paid_at) : new Date(order.updated_at);
            localStorage.setItem('payment_success', 'true');
            console.log('Order payment confirmed!');
          } else if (order.payment_status === 'pending') {
            this.errorMessage = 'Your payment is still pending. Please wait or contact support.';
          } else if (order.payment_status === 'failed') {
            this.errorMessage = 'Your payment failed. Please try again or contact support.';
          } else {
            this.errorMessage = 'Payment status is not confirmed. Please contact support.';
          }
        } else {
          this.errorMessage = 'Unable to fetch order details. Please contact support.';
        }
        
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Order details error:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to fetch order details. Please contact support.';
        this.cdr.detectChanges();
      }
    });
  }

  goToCourses(): void {
    this.router.navigate(['/student/my-courses']);
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
      this.orderService.downloadInvoice(this.orderId, 'student');
    } else {
      alert('No invoice available yet.');
    }
  }

  contactSupport(): void {
    window.location.href = 'mailto:support@yourdomain.com?subject=Payment%20Issue&body=Order%20Number:%20' + this.orderNumber;
  }
}