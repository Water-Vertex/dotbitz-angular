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

  // Already enrolled check
  isAlreadyEnrolled: boolean = false;

  // Monthly Payment Properties
  isMonthlyPayment: boolean = false;
  monthlyFee: number = 0;
  totalMonths: number = 0;
  currentMonth: number = 1;

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

        // Calculate monthly fee
        this.calculateMonthlyFee();

        // Check if student is already enrolled in this course
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

  // Calculate monthly fee based on course duration
  calculateMonthlyFee(): void {
    if (this.course && this.course.start_date && this.course.end_date) {
      const start = new Date(this.course.start_date);
      const end = new Date(this.course.end_date);

      // Calculate months difference
      const yearDiff = end.getFullYear() - start.getFullYear();
      const monthDiff = end.getMonth() - start.getMonth();
      this.totalMonths = (yearDiff * 12) + monthDiff;

      if (this.totalMonths <= 0) {
        this.totalMonths = 1; // Minimum 1 month
      }

      // Calculate monthly fee from discounted price
      const discountedPrice = this.course?.discounted_fee ?
        parseFloat(this.course.discounted_fee) :
        parseFloat(this.course?.course_fee || 0);

      this.monthlyFee = this.totalMonths > 0 ?
        parseFloat((discountedPrice / this.totalMonths).toFixed(2)) :
        discountedPrice;
    }
  }

  // Check enrollment status
  checkEnrollmentStatus(): void {
    if (this.student?.enrollments && Array.isArray(this.student.enrollments)) {
      this.isAlreadyEnrolled = this.student.enrollments.some(
        (enrollment: any) => enrollment.course_id === this.course?.id || enrollment.course?.id === this.course?.id
      );
    }

    if (this.isAlreadyEnrolled) {
      this.showBatchChangeToastMessage('You are already enrolled in this course!', 'warning');
    }
  }

  // Load batches
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

  // Amount calculations
  get subAmount(): number {
    if (this.isMonthlyPayment && this.monthlyFee) {
      return this.monthlyFee;
    }
    return parseFloat(this.course?.discounted_fee ? this.course?.discounted_fee : this.course?.course_fee || 0);
  }

  get discountAmount(): number {
    if (!this.couponApplied) return 0;
    if (this.discountType === 'percentage') {
      return parseFloat(((this.subAmount * this.discount) / 100).toFixed(2));
    }
    return parseFloat(Number(this.discount).toFixed(2));
  }

  get totalAmount(): number {
    if (this.isMonthlyPayment && this.monthlyFee) {
      const total = this.monthlyFee - this.discountAmount;
      return parseFloat((total < 0 ? 0 : total).toFixed(2));
    }
    const total = this.subAmount - this.discountAmount;
    return parseFloat((total < 0 ? 0 : total).toFixed(2));
  }

  get originalTotal(): number {
    return parseFloat(this.course?.course_fee || 0);
  }

  get discountedTotal(): number {
    return parseFloat(this.course?.discounted_fee || this.course?.course_fee || 0);
  }

  // Coupon methods
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

  // Toggle monthly payment
  toggleMonthlyPayment(event: any): void {
    this.isMonthlyPayment = event.target.checked;
    this.cdr.detectChanges();
  }

  // Submit order
  proceedToPay(): void {
    if (this.isAlreadyEnrolled) {
      this.showBatchChangeToastMessage('You are already enrolled in this course!', 'warning');
      return;
    }

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

    let subAmount = this.subAmount;
    let totalAmount = this.totalAmount;

    if (this.isMonthlyPayment) {
      subAmount = this.monthlyFee;
      totalAmount = this.monthlyFee - this.discountAmount;
    }

    const payload: any = {
      course_id: this.course.id,
      batch_id: this.batchId,
      sub_amount: subAmount,
      total_amount: totalAmount,
      discount: this.discountAmount,
      coupon_code: this.couponApplied ? this.couponCode : null,
      payment_method: this.paymentMethod,
      note: this.note,
      status: this.status,
      is_financed: this.isFinanced,
      finance_id: this.isFinanced ? this.financeId : null,
      finance_provider: this.isFinanced ? this.financeProvider : null,
      is_monthly_payment: this.isMonthlyPayment,
      total_months: this.isMonthlyPayment ? this.totalMonths : null,
      current_month: this.isMonthlyPayment ? this.currentMonth : null
    };

    if (this.paymentMethod === 'stripe') {
      payload.success_url = `${window.location.origin}/student/payment/confirmation`;
      payload.cancel_url = `${window.location.origin}/student/payment/cancellation`;
    }

    this.orderService.placeOrder(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.cdr.detectChanges();

        if (res.success) {
          if (res.data?.redirect && res.data?.checkout_url) {
            window.location.href = res.data.checkout_url;
          } else {
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

  // Helper methods
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

  formatTime(time: string): string {
    if (!time) return 'TBD';

    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  }

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
