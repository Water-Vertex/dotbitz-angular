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
  templateUrl: './checkout.html',
})
export class GuardianCheckout implements OnInit {
  guardian: any = {};
  students: any[] = [];
  courseId: any = null;
  course: any = null;

  loading: boolean = true;
  loadingGuardian: boolean = true;
  loadingCourse: boolean = true;
  submitting: boolean = false;

  // Coupon
  couponCode: string = '';
  couponApplied: boolean = false;
  couponError: string = '';
  discount: number = 0;
  discountType: string = ''; // 'fixed' or 'percentage'
  couponChecking: boolean = false;

  // ✅ New Property
  isAlreadyEnrolled: boolean = false;

  showMessage: boolean = false;
  messageText: string = '';
  messageType: 'success' | 'error' = 'success';

  // Order form fields
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
    status: 'pending',
    is_financed: false,
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

  // -----------------------------------------------
  // Student Selection Logic
  // -----------------------------------------------
  onStudentChange(): void {
    const selectedStudent = this.students.find((s) => s.id == this.order.student_id);
    this.isAlreadyEnrolled = false;

    if (selectedStudent) {
      // Check if student is already enrolled
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

  // -----------------------------------------------
  // Amounts
  // -----------------------------------------------
  get subAmount(): number {
    return parseFloat(this.order.sub_amount || 0);
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

  calculateTotal(): void {
    const sub = Number(this.order.sub_amount) || 0;
    if (this.couponApplied) {
      const type = this.discountType;
      const value = this.discount;
      if (type === 'percentage') {
        this.order.discount = (sub * value) / 100;
      } else if (type === 'fixed') {
        this.order.discount = value;
      }
    } else {
      this.order.discount = 0;
    }
    if (this.order.discount > sub) this.order.discount = sub;
    this.order.total_amount = sub - this.order.discount;
    if (this.order.total_amount < 0) this.order.total_amount = 0;
    this.cdr.detectChanges();
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
          this.order.coupon_code = this.couponCode;
          this.calculateTotal();
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
    this.order.coupon_code = '';
    this.calculateTotal();
  }

  // -----------------------------------------------
  // Submit Order
  // -----------------------------------------------
  proceedToCheckout(): void {
    if (this.isAlreadyEnrolled) return;

    if (!this.order.student_id) {
      this.messageText = 'Please select a student.';
      this.messageType = 'error';
      this.showMessage = true;
      setTimeout(() => (this.showMessage = false), 3000);
      return;
    }

    if (!this.order.payment_method) {
      this.messageText = 'Please select a payment method.';
      this.messageType = 'error';
      this.showMessage = true;
      setTimeout(() => (this.showMessage = false), 3000);
      return;
    }

    if (this.order.is_financed && (!this.order.finance_id?.trim() || !this.order.finance_provider?.trim())) {
      this.messageText = 'Please fill in Finance ID and Finance Provider.';
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
      total_amount: Number(this.totalAmount),
      coupon_code: this.couponApplied ? this.couponCode : null,
      discount: Number(this.discountAmount),
      payment_method: this.order.payment_method,
      note: this.order.note,
      is_financed: this.order.is_financed,
      finance_provider: this.order.is_financed ? this.order.finance_provider : null,
      finance_id: this.order.is_financed ? this.order.finance_id : null,
      order_number: this.order.order_number,
      status: this.order.status,
    };

    this.submitting = true;
    this.orderService.placeGuardianOrder(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          this.messageText = 'Enrollment completed successfully!';
          this.messageType = 'success';
          this.showMessage = true;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.showMessage = false;
            this.router.navigate(['/guardian/courses/list']);
          }, 2500);
        }
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          this.messageText = 'This student is already enrolled in this course!';
        } else {
          this.messageText = err?.error?.message || 'Failed to place order. Please try again.';
        }
        this.messageType = 'error';
        this.showMessage = true;
        this.cdr.detectChanges();
        setTimeout(() => (this.showMessage = false), 4000);
      },
    });
  }
}
