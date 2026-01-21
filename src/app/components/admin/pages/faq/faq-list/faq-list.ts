import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { FaqService } from '../../../../../services/faq.services';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './faq-list.html',
  styleUrls: ['./faq-list.css']
})
export class FaqList implements OnInit, OnDestroy {
  faqs: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false; // Add loading state

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private faqService: FaqService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Listen for navigation events to reload data when returning to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      // Only reload if we're navigating to this component
      if (event.url === '/admin/faq/list' || event.url.includes('/admin/faq')) {
        console.log('Navigation detected, reloading FAQs');
        setTimeout(() => {
          this.loadFAQs();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('FAQ List Component initialized');
    
    // Load data immediately
    this.loadFAQs();

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadFAQs();
    });
  }

  loadFAQs(): void {
    console.log('Loading FAQs...');
    this.isLoading = true;
    this.cdr.detectChanges(); // Update UI to show loading
    
    this.faqService.getFAQs().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        // Extract data from response
        if (response?.faqs && Array.isArray(response.faqs)) {
          this.faqs = [...response.faqs]; // Create new array reference
        } else if (Array.isArray(response)) {
          this.faqs = [...response]; // Create new array reference
        } else {
          this.faqs = [];
        }
        
        this.totalItems = this.faqs.length;
        console.log('FAQs loaded:', this.faqs.length, 'items');
        
        this.isLoading = false;
        this.cdr.detectChanges(); // Update UI to hide loading
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.toastService.error('Error', 'Failed to load FAQs. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Add a manual refresh method
  refreshData(): void {
    console.log('Manual refresh triggered');
    this.loadFAQs();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editFAQ(id: number): void {
    this.router.navigate(['/admin/faq/edit', id]);
  }

  deleteFAQ(id: number): void {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      console.log('Deleting FAQ ID:', id);
      
      // Show loading for delete operation
      const deleteLoading = true;
      
      // Optimistically remove from UI
      const index = this.faqs.findIndex(faq => faq.id === id);
      if (index !== -1) {
        this.faqs.splice(index, 1);
        this.totalItems = this.faqs.length;
        this.cdr.detectChanges(); // Update UI immediately
      }
      
      this.faqService.deleteFAQ(id).subscribe({
        next: (response: any) => {
          console.log('Delete successful:', response);
          this.toastService.success('Success', response?.message || 'FAQ deleted successfully!');
          
          // Reload to ensure sync with server
          this.loadFAQs();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.toastService.error('Error', 'Failed to delete FAQ. Please try again.');
          
          // Reload data to revert optimistic update if failed
          this.loadFAQs();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  trackById(index: number, faq: any): number {
    return faq.id; // Use unique ID for better ngFor performance
  }
}