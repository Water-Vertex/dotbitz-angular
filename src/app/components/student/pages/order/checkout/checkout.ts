import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../../services/course.service';
import { StudentService } from '../../../../../services/student.service';
import { OrderService } from '../../../../../services/order.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-student-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.html',
})
export class StudentCheckout implements OnInit {
  course: any = null;
  student: any = null;
  loading = true;
  submitting = false;

  // Batch
  batches: any[] = [];
  selectedBatch: any = null;
  batchSchedules: any[] = [];
  batchId: number | null = null;
  loadingBatches = false;
  loadingSchedules = false;

  // Coupon
  couponCode: string = '';
  couponApplied: boolean = false;
  couponError: string = '';
  discount: number = 0;
  discountType: string = '';
  couponChecking: boolean = false;

  // Order form fields
  paymentMethod: string = '';
  note: string = '';
  status: string = 'pending';
  isFinanced: boolean = false;
  financeId: string = '';
  financeProvider: string = '';
  batchFull: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private studentService: StudentService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    if (courseId) {
      this.fetchData(+courseId);
    }
  }

  fetchData(courseId: number): void {
    this.loading = true;
    forkJoin({
      student: this.studentService.getProfile(),
      course: this.courseService.getCourseDetail(courseId)
    }).subscribe({
      next: ({ student, course }) => {
        this.student = student;
        this.course = course.data;
        this.loading = false;
        this.loadBatches(courseId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // -----------------------------------------------
  // Batch Logic
  // -----------------------------------------------
  loadBatches(courseId: number): void {
    this.loadingBatches = true;
    this.orderService.getBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = res;
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingBatches = false;
      }
    });
  }

  onBatchChange(): void {
    this.batchFull = false;
    this.batchSchedules = [];

    if (!this.batchId) {
      this.selectedBatch = null;
      return;
    }

    this.selectedBatch = this.batches.find(b => b.id == this.batchId);
    this.batchFull = this.selectedBatch?.is_full ?? false;

    this.loadingSchedules = true;
    this.orderService.getSchedulesByBatch(this.batchId!).subscribe({
      next: (res: any) => {
        this.batchSchedules = res.data;
        this.loadingSchedules = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSchedules = false;
      }
    });

    this.cdr.detectChanges();
  }

  // -----------------------------------------------
  // Amounts
  // -----------------------------------------------
  get subAmount(): number {
    return parseFloat(this.course?.course_fee ?? 0);
  }

  get discountAmount(): number {
    if (!this.couponApplied) return 0;
    if (this.discountType === 'percentage') {
      return parseFloat(((this.subAmount * this.discount) / 100).toFixed(2));
    }
    return parseFloat(Number(this.discount).toFixed(2));
  }

  get totalAmount(): number {
    const total = this.subAmount - this.discountAmount;
    return parseFloat((total < 0 ? 0 : total).toFixed(2));
  }

  // -----------------------------------------------
  // Coupon Logic
  // -----------------------------------------------
  applyCoupon(): void {
    this.couponError = '';
    this.couponApplied = false;
    this.discount = 0;

    if (!this.couponCode.trim()) {
      this.couponError = 'Please enter a coupon code.';
      return;
    }

    this.couponChecking = true;

    this.orderService.validateCoupon(this.couponCode.trim()).subscribe({
      next: (res: any) => {
        this.couponChecking = false;
        if (res.success) {
          this.couponApplied = true;
          this.discount = parseFloat(res.data.discount_value);
          this.discountType = res.data.discount_type;
          this.cdr.detectChanges();
        } else {
          this.couponError = res.message || 'Invalid coupon code.';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.couponChecking = false;
        this.couponError = 'Invalid or expired coupon code.';
        this.cdr.detectChanges();
      }
    });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponApplied = false;
    this.discount = 0;
    this.discountType = '';
    this.couponError = '';
  }

  // -----------------------------------------------
  // Submit Order
  // -----------------------------------------------
  proceedToPay(): void {
    // Validation checks
    if (!this.batchId) {
      alert('Please select a batch.');
      return;
    }
    if (!this.paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    if (this.isFinanced && (!this.financeId.trim() || !this.financeProvider.trim())) {
      alert('Please fill in Finance ID and Finance Provider.');
      return;
    }
    if (this.batchFull) {
      alert('This batch is full. Please select another batch.');
      return;
    }

    this.submitting = true;

    const payload: any = {
      course_id: this.course.id,
      batch_id: this.batchId,
      sub_amount: this.subAmount,
      total_amount: this.totalAmount,
      discount: this.discountAmount,
      coupon_code: this.couponApplied ? this.couponCode : null,
      payment_method: this.paymentMethod,
      note: this.note,
      status: this.status,
      is_financed: this.isFinanced,
      finance_id: this.isFinanced ? this.financeId : null,
      finance_provider: this.isFinanced ? this.financeProvider : null,
    };

    // Add success and cancel URLs for Stripe payment
    if (this.paymentMethod === 'stripe') {
      payload.success_url = `${window.location.origin}/student/payment/confirmation`;
      payload.cancel_url = `${window.location.origin}/student/payment/cancellation`;
    }

    this.orderService.placeOrder(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          // Check if this is a Stripe payment that requires redirect
          if (res.data?.redirect && res.data?.checkout_url) {
            // Redirect to Stripe Checkout page
            window.location.href = res.data.checkout_url;
          } else {
            // Non-Stripe payment (cash, bank transfer, etc.)
            alert('Order placed successfully! Order #' + res.data.order_number);
            this.router.navigate(['/student/courses/list']);
          }
        } else {
          alert(res.message || 'Failed to place order. Please try again.');
        }
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          alert('You are already enrolled in this course!');
        } else if (err.status === 422) {
          // Handle validation errors
          const errorMessage = err.error?.message || 'Invalid data. Please check your input.';
          alert(errorMessage);
        } else {
          console.error('Order placement error:', err);
          alert('Failed to place order. Please try again.');
        }
      }
    });
  }
}
