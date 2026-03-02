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

  // Coupon
  couponCode: string = '';
  couponApplied: boolean = false;
  couponError: string = '';
  discount: number = 0;
  discountType: string = ''; // 'fixed' or 'percentage'
  couponChecking: boolean = false;

  // Order form fields
  paymentMethod: string = '';
  note: string = '';
  status: string = 'pending';
  isFinanced: boolean = false;
  financeId: string = '';
  financeProvider: string = '';

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
      course: this.courseService.getStudentCourseDetail(courseId)
    }).subscribe({
      next: ({ student, course }) => {
        this.student = student;
        this.course = course.data;
        this.loading = false;
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
  // Amounts
  // -----------------------------------------------
  get subAmount(): number {
    return parseFloat(this.course?.course_fee ?? 0);
  }

  // get discountAmount(): number {
  //   if (!this.couponApplied) return 0;
  //   if (this.discountType === 'percentage') {
  //     return parseFloat(((this.subAmount * this.discount) / 100).toFixed(2));
  //   }
  //   // 'fixed'
  //   return parseFloat(this.discount.toFixed(2));
  // }
  get discountAmount(): number {
  if (!this.couponApplied) return 0;
  if (this.discountType === 'percentage') {
    return parseFloat(((this.subAmount * this.discount) / 100).toFixed(2));
  }
  return parseFloat(Number(this.discount).toFixed(2)); // ✅ Number() wrap karo
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
  console.log('Coupon response:', res.data); // yeh paste karo
  this.couponChecking = false;
  if (res.success) {
    this.couponApplied = true;
    this.discount = parseFloat(res.data.discount_value);
    this.discountType = res.data.discount_type;
    console.log('Discount type:', this.discountType); // exact value dekhni hai
    this.cdr.detectChanges();
  }
 else {
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
    if (!this.paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    if (this.isFinanced && (!this.financeId.trim() || !this.financeProvider.trim())) {
      alert('Please fill in Finance ID and Finance Provider.');
      return;
    }

    this.submitting = true;

    const payload = {
      course_id:        this.course.id,
      sub_amount:       this.subAmount,
      total_amount:     this.totalAmount,
      discount:         this.discountAmount,
      coupon_code:      this.couponApplied ? this.couponCode : null,
      payment_method:   this.paymentMethod,
      note:             this.note,
      status:           this.status,
      is_financed:      this.isFinanced,
      finance_id:       this.isFinanced ? this.financeId : null,
      finance_provider: this.isFinanced ? this.financeProvider : null,
    };

    this.orderService.placeOrder(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Order placed successfully! Order #' + res.data.order_number);
          this.router.navigate(['/student/courses/list']);
        }
      },
     error: (err) => {
  this.submitting = false;
  if (err.status === 409) {
    alert('You are already enrolled in this course!');
  } else {
    alert('Failed to place order. Please try again.');
  }
}
    });
  }
}
