import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CouponService } from '../../../../../services/coupon.service';
import { ToastService } from '../../../../../services/toast.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-coupon-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './coupon-edit.html',
  styleUrls: ['./coupon-edit.css'], 
})
export class CouponEdit implements OnInit, OnDestroy {
  couponForm: FormGroup;
  couponId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  private routeSub?: Subscription;

  // ✅ CKEditor
  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'indent',
      'outdent',
      '|',
      'link',
      '|',
      'blockQuote',
      '|',
      'undo',
      'redo',
    ],
  };

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      discount_type: ['', Validators.required],
      usage_limit: [null],
      discount_amount: [null],
      description: ['', [Validators.required, Validators.minLength(2)]],
      is_active: [true],
      valid_from: ['', Validators.required],
      valid_until: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !isNaN(id)) {
        this.couponId = +id;
        this.loadCoupon(this.couponId);
      } else {
        this.toast.error('Error', 'Invalid Coupon ID');
        this.router.navigate(['/admin/coupon/list']);
      }
    });
  }

  loadCoupon(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.couponService.getCoupon(id).subscribe({
      next: (res) => {
        const data = res.data ?? res;

        if (!data || !data.code) {
          this.toast.error('Error', 'Coupon not found');
          this.router.navigate(['/admin/coupon/list']);
          return;
        }

        this.couponForm.patchValue({
          code: data.code,
          discount_type: data.discount_type,
          discount_amount: data.discount_amount,
          usage_limit: data.usage_limit,
          description: data.description,
          is_active: data.is_active,
          valid_from: data.valid_from,
          valid_until: data.valid_until,
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to load coupon');
        this.router.navigate(['/admin/coupon/list']);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    if (this.couponForm.invalid || !this.couponId) {
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    this.couponService.updateCoupon(this.couponId, this.couponForm.value).subscribe({
      next: () => {
        this.toast.success('Success', 'Coupon updated successfully');
        setTimeout(() => {
          this.router.navigate(['/admin/coupon/list']);
        }, 1500);
      },
      error: (err) => this.handleError(err),
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  handleError(error: any): void {
    if (error.status === 422) {
      this.toast.error('Validation Error', 'Invalid coupon data');
    } else if (error.status === 401) {
      this.toast.error('Unauthorized', 'Please login again');
      this.router.navigate(['/login']);
    } else {
      this.toast.error('Error', 'Failed to update coupon');
    }
    this.isSubmitting = false;
  }

  cancel(): void {
    this.router.navigate(['/admin/coupon/list']);
  }

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

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}
