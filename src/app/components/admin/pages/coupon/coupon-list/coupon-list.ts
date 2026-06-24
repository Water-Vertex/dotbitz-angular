import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { CouponService } from '../../../../../services/coupon.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coupon-list.html'
})
export class CouponList implements OnInit, OnDestroy {

  coupons: any[] = [];
  totalItems = 0;
  isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private couponService: CouponService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadCoupons());
  }

  ngOnInit(): void {
    this.loadCoupons();
  }
 can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }
  loadCoupons(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.couponService.getCoupons()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response?.data)) {
            this.coupons = [...response.data];
          } else if (Array.isArray(response)) {
            this.coupons = [...response];
          } else {
            this.coupons = [];
          }

          this.totalItems = this.coupons.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.error('Error', 'Failed to load coupons');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  refreshData(): void {
    this.loadCoupons();
  }

  deleteCoupon(id: number): void {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    const index = this.coupons.findIndex(c => c.id === id);
    if (index !== -1) {
      this.coupons.splice(index, 1);
      this.totalItems = this.coupons.length;
      this.cdr.detectChanges();
    }

    this.couponService.deleteCoupon(id).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', res?.message || 'Coupon deleted');
        this.loadCoupons();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to delete coupon');
        this.loadCoupons();
      }
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
