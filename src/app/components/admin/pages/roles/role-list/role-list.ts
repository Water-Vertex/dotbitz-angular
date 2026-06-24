import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { RoleService } from '../../../../../services/role.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './role-list.html',
  styleUrls: ['./role-list.css']
})
export class RoleList implements OnInit, OnDestroy {
  roles: any[] = [];
  filteredRoles: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private roleService: RoleService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public auth: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.url.includes('/admin/roles')) {
        setTimeout(() => this.loadRoles(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.filterRoles());
  }

  loadRoles(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.roleService.getRoles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          this.roles = [...response.data];
        } else if (Array.isArray(response)) {
          this.roles = [...response];
        } else {
          this.roles = [];
        }
        this.filteredRoles = [...this.roles];
        this.totalItems = this.roles.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastService.error('Error', 'Failed to load roles.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterRoles(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(r =>
        r.name.toLowerCase().includes(term)
      );
    }
    this.totalItems = this.filteredRoles.length;
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  refreshData(): void {
    this.loadRoles();
  }

  deleteRole(id: number): void {
    if (confirm('Are you sure you want to delete this role?')) {
      const index = this.roles.findIndex(r => r.id === id);
      if (index !== -1) {
        this.roles.splice(index, 1);
        this.filteredRoles = [...this.roles];
        this.totalItems = this.roles.length;
        this.cdr.detectChanges();
      }

      this.roleService.deleteRole(id).subscribe({
        next: (response: any) => {
          this.toastService.success('Success', response?.message || 'Role deleted successfully!');
          this.loadRoles();
        },
        error: (error) => {
          this.toastService.error('Error', 'Failed to delete role.');
          this.loadRoles();
        }
      });
    }
  }

  can(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }

  trackById(index: number, role: any): number {
    return role.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}