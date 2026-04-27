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
  showBatchChangeToast = false;
  toastTimeout: any;
  toastMessage = '';
  toastType: 'info' | 'success' | 'error' | 'warning' = 'info';

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
  
  // ✅ ADDED: Already enrolled check
  isAlreadyEnrolled: boolean = false;

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
        
        // ✅ ADDED: Check if student is already enrolled in this course
        this.checkEnrollmentStatus();
        
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

  // ✅ ADDED: Method to check if student is already enrolled
  checkEnrollmentStatus(): void {
    // Check if student has enrollments array and if this course exists in it
    if (this.student?.enrollments && Array.isArray(this.student.enrollments)) {
      this.isAlreadyEnrolled = this.student.enrollments.some(
        (enrollment: any) => enrollment.course_id === this.course?.id || enrollment.course?.id === this.course?.id
      );
    }
    
    // If already enrolled, show warning message
    if (this.isAlreadyEnrolled) {
      this.showBatchChangeToastMessage('You are already enrolled in this course!', 'warning');
    }
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
        this.cdr.detectChanges();
      }
    });
  }

  onBatchChange(): void {
    this.batchFull = false;
    this.batchSchedules = [];

    if (!this.batchId) {
      this.selectedBatch = null;
      this.showBatchChangeToastMessage('Please select a batch', 'info');
      this.cdr.detectChanges();
      return;
    }

    this.selectedBatch = this.batches.find(b => b.id == this.batchId);
    
    if (!this.selectedBatch) {
      return;
    }

    this.batchFull = this.selectedBatch?.is_full ?? false;

    if (this.batchFull) {
      this.showBatchChangeToastMessage('This batch is full. Please select another batch.', 'warning');
      this.cdr.detectChanges();
      return;
    }

    // Show loading toast
    this.showBatchChangeToastMessage(`Loading schedule for ${this.selectedBatch.name}...`, 'info');
    this.loadingSchedules = true;
    this.cdr.detectChanges();

    this.orderService.getSchedulesByBatch(this.batchId!).subscribe({
      next: (res: any) => {
        this.batchSchedules = res.data || [];
        this.loadingSchedules = false;
        
        if (this.batchSchedules.length > 0) {
          this.showBatchChangeToastMessage(
            `✓ Schedule loaded for ${this.selectedBatch?.name}`,
            'success'
          );
        } else {
          this.showBatchChangeToastMessage(
            'No schedule available for this batch',
            'info'
          );
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.loadingSchedules = false;
        this.batchSchedules = [];
        this.showBatchChangeToastMessage(
          'Failed to load schedule. Please try again.',
          'error'
        );
        this.cdr.detectChanges();
      }
    });
  }

  showBatchChangeToastMessage(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    this.toastMessage = message;
    this.toastType = type;
    this.showBatchChangeToast = true;
    this.cdr.detectChanges();
    
    this.toastTimeout = setTimeout(() => {
      this.showBatchChangeToast = false;
      this.cdr.detectChanges();
    }, 3000);
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
      this.cdr.detectChanges();
      return;
    }

    this.couponChecking = true;
    this.cdr.detectChanges();

    this.orderService.validateCoupon(this.couponCode.trim()).subscribe({
      next: (res: any) => {
        this.couponChecking = false;
        if (res.success) {
          this.couponApplied = true;
          this.discount = parseFloat(res.data.discount_value);
          this.discountType = res.data.discount_type;
          this.showBatchChangeToastMessage(`Coupon applied! ${this.discount}${this.discountType === 'percentage' ? '%' : '$'} off`, 'success');
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
    this.showBatchChangeToastMessage('Coupon removed', 'info');
    this.cdr.detectChanges();
  }

  // -----------------------------------------------
  // Submit Order
  // -----------------------------------------------
  proceedToPay(): void {
    // ✅ UPDATED: Add already enrolled validation
    if (this.isAlreadyEnrolled) {
      this.showBatchChangeToastMessage('You are already enrolled in this course!', 'warning');
      return;
    }
    
    // Validation checks
    if (!this.batchId) {
      this.showBatchChangeToastMessage('Please select a batch', 'warning');
      return;
    }
    if (!this.paymentMethod) {
      this.showBatchChangeToastMessage('Please select a payment method', 'warning');
      return;
    }
    if (this.isFinanced && (!this.financeId.trim() || !this.financeProvider.trim())) {
      this.showBatchChangeToastMessage('Please fill in Finance ID and Finance Provider', 'warning');
      return;
    }
    if (this.batchFull) {
      this.showBatchChangeToastMessage('This batch is full. Please select another batch', 'warning');
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

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
        this.cdr.detectChanges();
        
        if (res.success) {
          // Check if this is a Stripe payment that requires redirect
          if (res.data?.redirect && res.data?.checkout_url) {
            // Redirect to Stripe Checkout page
            window.location.href = res.data.checkout_url;
          } else {
            // Non-Stripe payment (cash, bank transfer, etc.)
            this.showBatchChangeToastMessage(`Order placed successfully! Order #${res.data.order_number}`, 'success');
            setTimeout(() => {
              this.router.navigate(['/student/courses/list']);
            }, 2000);
          }
        } else {
          this.showBatchChangeToastMessage(res.message || 'Failed to place order. Please try again.', 'error');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.cdr.detectChanges();
        
        if (err.status === 409) {
          this.showBatchChangeToastMessage('You are already enrolled in this course!', 'warning');
        } else if (err.status === 422) {
          const errorMessage = err.error?.message || 'Invalid data. Please check your input.';
          this.showBatchChangeToastMessage(errorMessage, 'error');
        } else {
          console.error('Order placement error:', err);
          this.showBatchChangeToastMessage('Failed to place order. Please try again.', 'error');
        }
      }
    });
  }

  // -----------------------------------------------
  // Helper Methods
  // -----------------------------------------------
  
  // Format batch date range in human-readable format
  formatBatchDateRange(batch: any): string {
    if (!batch || !batch.start_date || !batch.end_date) return 'Date TBD';
    
    const start = new Date(batch.start_date);
    const end = new Date(batch.end_date);
    
    const startMonth = start.toLocaleString('default', { month: 'short' });
    const endMonth = end.toLocaleString('default', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }

  // Format time to 12-hour format
  formatTime(time: string): string {
    if (!time) return 'TBD';
    
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  }

  // Calculate duration between two times
  getDuration(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return 'TBD';
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (durationMinutes < 0) durationMinutes += 24 * 60;
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours} hr ${minutes} min`;
  }

  // Get short day name
  getShortDay(day: string): string {
    if (!day) return '';
    
    const dayMap: { [key: string]: string } = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    return dayMap[day.toLowerCase()] || day.substring(0, 3);
  }
}