import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuardianService } from '../../../../../services/guardian.service';
import { CourseService } from '../../../../../services/course.service';
import { OrderService } from '../../../../../services/order.service';

@Component({
  selector: 'app-guardian-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './guardian-checkout.html',
  styleUrls: ['./guardian-checkout.css'],
})
export class GuardianCheckout implements OnInit {
  guardian: any = {};
  students: any[] = [];
  courseId: any = null;
  course: any = null;

  loading: boolean = true;
  loadingGuardian: boolean = true;
  loadingCourse: boolean = true;
  couponLoading: boolean = false;
  orderLoading: boolean = false;
  currentCoupon: any = null;

  // ✅ New Property
  isAlreadyEnrolled: boolean = false;

  showMessage: boolean = false;
  messageText: string = '';
  messageType: 'success' | 'error' = 'success';

  order: any = {
    guardian_id: '',
    student_id: '',
    student_uid: '',
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    state: '',
    city: '',
    zipcode: '',
    order_number: '',
    sub_amount: 0,
    total_amount: 0,
    status: 'completed',
    is_financeed: false,
    finance_id: '',
    finance_provider: '',
    discount: 0,
    coupon_code: '',
    payment_method: '',
    note: '',
  };

  constructor(
    private guardianService: GuardianService,
    private courseService: CourseService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    const incomingFee = this.route.snapshot.queryParamMap.get('fee');

    if (incomingFee) {
      this.order.sub_amount = Number(incomingFee);
    }

    this.generateOrderNumber();
    this.loadData();
  }

  generateOrderNumber(): void {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.order.order_number = `ORD-${randomNum}`;
  }

  loadData(): void {
    this.loadingGuardian = true;
    this.guardianService.getGuardianStudents().subscribe({
      next: (res: any) => {
        this.guardian = res;
        this.students = res.students || [];
        this.order.guardian_id = this.guardian.id;
        this.loadingGuardian = false;
        this.checkLoading();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load guardian data', err);
        this.loadingGuardian = false;
        this.checkLoading();
      },
    });

    this.loadingCourse = true;
    this.courseService.getGuardianCourseDetail(+this.courseId).subscribe({
      next: (res: any) => {
        this.course = res.data;
        if (!this.order.sub_amount && this.course?.course_fee) {
          this.order.sub_amount = Number(this.course.course_fee);
        }
        this.calculateTotal();
        this.loadingCourse = false;
        this.checkLoading();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load course', err);
        this.loadingCourse = false;
        this.checkLoading();
      },
    });
  }

  private checkLoading() {
    if (!this.loadingGuardian && !this.loadingCourse) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // 🔥 Updated onStudentChange Logic
  onStudentChange(): void {
    const selectedStudent = this.students.find((s) => s.id == this.order.student_id);
    this.isAlreadyEnrolled = false; // Reset checking

    if (selectedStudent) {
      // ✅ Checking if student is already enrolled
      if (selectedStudent.enrollments && Array.isArray(selectedStudent.enrollments)) {
        this.isAlreadyEnrolled = selectedStudent.enrollments.some(
          (e: any) => e.course_id == this.courseId || e.course?.id == this.courseId,
        );
      }

      if (this.isAlreadyEnrolled) {
        this.messageText = `${selectedStudent.first_name} is already enrolled in this course!`;
        this.messageType = 'error';
        this.showMessage = true;
        setTimeout(() => (this.showMessage = false), 4000);
      }

      this.order.student_uid = selectedStudent.student_uid || '';
      this.order.first_name = selectedStudent.first_name || '';
      this.order.last_name = selectedStudent.last_name || '';
      this.order.user_name = selectedStudent.user_name || '';
      this.order.email = selectedStudent.email || '';
      this.order.phone = selectedStudent.phone || '';
      this.order.address = selectedStudent.address || '';
      this.order.city = selectedStudent.city || '';
      this.order.state = selectedStudent.state || '';
      this.order.zipcode = selectedStudent.zipcode || '';
      this.order.date_of_birth = selectedStudent.date_of_birth || '';
      this.order.gender = selectedStudent.gender || '';
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    const sub = Number(this.order.sub_amount) || 0;
    if (this.currentCoupon) {
      const type = this.currentCoupon.discount_type;
      const value =
        Number(this.currentCoupon.discount_value) ||
        Number(this.currentCoupon.discount_amount) ||
        0;
      if (type === 'percentage') {
        this.order.discount = (sub * value) / 100;
      } else if (type === 'fixed') {
        this.order.discount = value;
      }
    }
    if (this.order.discount > sub) this.order.discount = sub;
    this.order.total_amount = sub - this.order.discount;
    if (this.order.total_amount < 0) this.order.total_amount = 0;
    this.cdr.detectChanges();
  }

  applyCoupon(): void {
    if (!this.order.coupon_code) return;
    this.couponLoading = true;
    this.orderService.validateCoupon(this.order.coupon_code).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.currentCoupon = res.data;
          this.calculateTotal();
        }
        this.couponLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.messageText = err?.error?.message || 'Invalid coupon code';
        this.messageType = 'error';
        this.showMessage = true;
        setTimeout(() => (this.showMessage = false), 3000);
        this.currentCoupon = null;
        this.order.discount = 0;
        this.calculateTotal();
        this.couponLoading = false;
      },
    });
  }

  proceedToCheckout(): void {
    if (this.isAlreadyEnrolled) return;

    if (!this.order.student_id || !this.order.payment_method) {
      this.messageText = 'Please select a student and payment method.';
      this.messageType = 'error';
      this.showMessage = true;
      setTimeout(() => (this.showMessage = false), 3000);
      return;
    }

    const payload = {
      guardian_id: this.order.guardian_id,
      student_id: Number(this.order.student_id),
      course_id: Number(this.course?.id),
      first_name: this.order.first_name,
      last_name: this.order.last_name,
      email: this.order.email,
      phone: this.order.phone,
      sub_amount: Number(this.order.sub_amount),
      total_amount: Number(this.order.total_amount),
      coupon_code: this.order.coupon_code,
      discount: Number(this.order.discount),
      payment_method: this.order.payment_method,
      note: this.order.note,
      is_financeed: this.order.is_financeed,
      finance_provider: this.order.finance_provider,
      finance_id: this.order.finance_id,
      order_number: this.order.order_number,
      status: this.order.status,
    };

    this.orderLoading = true;
    this.orderService.placeOrder(payload).subscribe({
      next: (res: any) => {
        this.orderLoading = false;
        if (res.success) {
          // ✅ Success notification dikhayen
          this.messageText = 'Enrollment completed successfully! Refreshing...';
          this.messageType = 'success';
          this.showMessage = true;
          this.cdr.detectChanges();

          // ✅ 2.5 seconds baad screen reload ho jayegi
          setTimeout(() => {
            this.showMessage = false;
            window.location.reload();
          }, 2500);
        }
      },
      error: (err) => {
        this.orderLoading = false;
        this.messageText = err?.error?.message || 'Failed to place order';
        this.messageType = 'error';
        this.showMessage = true;
        this.cdr.detectChanges();
        setTimeout(() => (this.showMessage = false), 4000);
      },
    });
  }
}
