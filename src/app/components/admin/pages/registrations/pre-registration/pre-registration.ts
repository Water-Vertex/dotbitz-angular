import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { RegistrationService } from '../../../../../services/registration.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-pre-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pre-registration.html',
  styleUrls: ['./pre-registration.css']
})
export class PreRegistrationComponent implements OnInit, OnDestroy {
  registrations: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private preRegistrationService: RegistrationService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {
    // Listen for navigation events to reload data when returning to this page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.url === '/admin/pre-registration' || event.url.includes('/admin/pre-registration')) {
        console.log('Navigation detected, reloading registrations');
        setTimeout(() => {
          this.loadRegistrations();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    console.log('Pre-Registration Component initialized');

    // Load data immediately
    this.loadRegistrations();

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filterRegistrations();
    });
  }

  loadRegistrations(): void {
    console.log('Loading registrations...');
    this.isLoading = true;
    this.cdr.detectChanges();

    this.preRegistrationService.getRegistrations().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);

          // Extract data from response
          if (response?.registrations && Array.isArray(response.registrations)) {
            this.registrations = [...response.registrations];
          } else if (Array.isArray(response)) {
            this.registrations = [...response];
          } else if (response?.data && Array.isArray(response.data)) {
            this.registrations = [...response.data];
          } else {
            this.registrations = [];
          }

          this.totalItems = this.registrations.length;
          console.log('Registrations loaded:', this.registrations.length, 'items');

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading registrations:', error);
          this.toastService.error('Error', 'Failed to load registrations. Please try again.');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  filterRegistrations(): void {
    // If no search term, just show all registrations
    if (!this.searchTerm.trim()) {
      this.loadRegistrations();
      return;
    }

    // Filter locally for better performance
    this.isLoading = true;
    this.preRegistrationService.getRegistrations().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          let allRegistrations: any[] = [];

          if (response?.registrations && Array.isArray(response.registrations)) {
            allRegistrations = response.registrations;
          } else if (Array.isArray(response)) {
            allRegistrations = response;
          } else if (response?.data && Array.isArray(response.data)) {
            allRegistrations = response.data;
          } else {
            allRegistrations = [];
          }

          // Filter based on search term
          const searchTermLower = this.searchTerm.toLowerCase();
          this.registrations = allRegistrations.filter(reg => {
            return (
              (reg.name && reg.name.toLowerCase().includes(searchTermLower)) ||
              (reg.email && reg.email.toLowerCase().includes(searchTermLower)) ||
              (reg.phone && reg.phone.toLowerCase().includes(searchTermLower)) ||
              (reg.message && reg.message.toLowerCase().includes(searchTermLower)) ||
              (reg.id && reg.id.toString().includes(searchTermLower))
            );
          });

          this.totalItems = this.registrations.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error filtering registrations:', error);
          this.toastService.error('Error', 'Failed to filter registrations.');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  refreshData(): void {
    console.log('Manual refresh triggered');
    this.loadRegistrations();
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  viewRegistration(id: number): void {
    this.router.navigate(['/admin/pre-registration/view', id]);
  }

  editRegistration(id: number): void {
    this.router.navigate(['/admin/pre-registration/edit', id]);
  }


  exportToCSV(): void {
    if (this.registrations.length === 0) {
      this.toastService.info('Warning', 'No data to export');
      return;
    }

    // Define CSV headers
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Message', 'Registration Date'];

    // Convert data to CSV format
    const csvData = this.registrations.map(reg => [
      reg.id,
      `"${reg.name || ''}"`,
      `"${reg.email || ''}"`,
      `"${reg.phone || ''}"`,
      `"${reg.message || ''}"`,
      reg.created_at || reg.registration_date || '',
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `pre-registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.toastService.success('Success', 'Data exported successfully!');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(index: number, registration: any): number {
    return registration.id;
  }
}
