import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CouponService } from '../../../../../services/coupon.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-coupon-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './coupon-add.html'
})
export class CouponAdd implements OnInit {
  couponForm: FormGroup;
  isEditMode = false;
  couponId: number | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      discount_type: ['', Validators.required],
      usage_limit: [null],
      discount_amount: [null],
      description: ['', [Validators.required, Validators.minLength(2)]],
      is_active: [true],
      valid_from: ['', Validators.required],
      valid_until: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.couponId = +id;
      this.loadCoupon(this.couponId);
    }
  }

  loadCoupon(id: number): void {
    this.isLoading = true;
    this.couponService.getCoupon(id).subscribe({
      next: res => {
        this.couponForm.patchValue(res.data);
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Error', 'Failed to load coupon');
        this.router.navigate(['/admin/coupon/list']);
      }
    });
  }

  onSubmit(): void {
    if (this.couponForm.invalid) {
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    const data = this.couponForm.value;

    const request = this.isEditMode && this.couponId
      ? this.couponService.updateCoupon(this.couponId, data)
      : this.couponService.createCoupon(data);

    request.subscribe({
      next: res => {
        this.toast.success('Success', res.message || 'Coupon saved successfully');
        this.router.navigate(['/admin/coupon/list']);
      },
      error: err => this.handleError(err),
      complete: () => (this.isSubmitting = false)
    });
  }

  handleError(error: any): void {
    if (error.status === 422) {
      this.toast.error('Validation Error', 'Invalid data provided');
    } else {
      this.toast.error('Error', 'Something went wrong');
    }
    this.isSubmitting = false;
  }

  cancel(): void {
    this.router.navigate(['/admin/coupon/list']);
  }

  // Form control getters
  get code() {
    return this.couponForm.get('code');
  }

  get discount_type() {
    return this.couponForm.get('discount_type');
  }

  get discount_amount() {
    return this.couponForm.get('discount_amount');
  }

  get description() {
    return this.couponForm.get('description');
  }

  get valid_from() {
    return this.couponForm.get('valid_from');
  }

  get valid_until() {
    return this.couponForm.get('valid_until');
  }
}
