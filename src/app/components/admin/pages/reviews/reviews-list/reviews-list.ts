import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../../../services/review.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reviews-list.html',
})
export class AdminReviews implements OnInit {

  reviews: any[]    = [];
  allReviews: any[] = [];
  loading  = false;
  deleting: number | null = null;

  selectedStatus = '';

  constructor(
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadReviews(); }

  loadReviews(): void {
    this.loading = true;
    this.reviewService.getAdminReviews().subscribe({
      next: (res: any) => {
        this.allReviews = res.data || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    this.reviews = this.selectedStatus
      ? this.allReviews.filter(r => r.status === this.selectedStatus)
      : [...this.allReviews];
    this.cdr.detectChanges();
  }

  updateStatus(id: number, status: string): void {
    this.reviewService.updateReviewStatus(id, status).subscribe({
      next: (res: any) => {
        const idx = this.allReviews.findIndex(r => r.id === id);
        if (idx !== -1) this.allReviews[idx] = res.data;
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => { alert('Failed to update status.'); }
    });
  }

  onDelete(id: number): void {
    if (!confirm('Delete this review?')) return;
    this.deleting = id;
    this.reviewService.deleteAdminReview(id).subscribe({
      next: () => {
        this.allReviews = this.allReviews.filter(r => r.id !== id);
        this.applyFilter();
        this.deleting = null;
        this.cdr.detectChanges();
      },
      error: () => { this.deleting = null; alert('Failed to delete.'); }
    });
  }

  getStars(rating: number): number[] { return Array.from({length: rating}, (_, i) => i + 1); }
  getEmptyStars(rating: number): number[] { return Array.from({length: 5 - rating}, (_, i) => i + 1); }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':  return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default:         return 'bg-gray-100 text-gray-600';
    }
  }
}
