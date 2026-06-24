import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { PolicyService } from '../../../../../services/policy.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './policy-list.html',
  styleUrls: ['./policy-list.css']
})
export class PolicyList implements OnInit, OnDestroy {
  policies: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false; // Add loading state

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private policyService: PolicyService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService,
    
  ) {
    // Listen for navigation events to reload data when returning to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      // Only reload if we're navigating to this component
      if (event.url === '/admin/policy/list' || event.url.includes('/admin/policy')) {
        console.log('Navigation detected, reloading Policies');
        setTimeout(() => {
          this.loadPolicies();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('Policy List Component initialized');

    // Load data immediately
    this.loadPolicies();

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadPolicies();
    });
  }
can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }
 
  loadPolicies(): void {
    console.log('Loading Policies...');
    this.isLoading = true;
    this.cdr.detectChanges(); // Update UI to show loading

    this.policyService.getPolicies().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        console.log('API Response:', response);

        // Extract data from response
        if (response?.policies && Array.isArray(response.policies)) {
          this.policies = [...response.policies]; // Create new array reference
        } else if (Array.isArray(response)) {
          this.policies = [...response]; // Create new array reference
        } else {
          this.policies = [];
        }

        this.totalItems = this.policies.length;
        console.log('Policies loaded:', this.policies.length, 'items');

        this.isLoading = false;
        this.cdr.detectChanges(); // Update UI to hide loading
      },
      error: (error) => {
        console.error('Error loading Policies:', error);
        this.toastService.error('Error', 'Failed to load Policies. Please try again.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Add a manual refresh method
  refreshData(): void {
    console.log('Manual refresh triggered');
    this.loadPolicies();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  editPolicy(id: number): void {
    this.router.navigate(['/admin/policy/edit', id]);
  }

  deletePolicy(id: number): void {
    if (confirm('Are you sure you want to delete this Policy?')) {
      console.log('Deleting Policy ID:', id);

      // Show loading for delete operation
      const deleteLoading = true;

      // Optimistically remove from UI
      const index = this.policies.findIndex(policy => policy.id === id);
      if (index !== -1) {
        this.policies.splice(index, 1);
        this.totalItems = this.policies.length;
        this.cdr.detectChanges(); // Update UI immediately
      }

      this.policyService.deletePolicy(id).subscribe({
        next: (response: any) => {
          console.log('Delete successful:', response);
          this.toastService.success('Success', response?.message || 'Policy deleted successfully!');

          // Reload to ensure sync with server
          this.loadPolicies();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.toastService.error('Error', 'Failed to delete Policy. Please try again.');

          // Reload data to revert optimistic update if failed
          this.loadPolicies();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, policy: any): number {
    return policy.id; // Use unique ID for better ngFor performance
  }
}
