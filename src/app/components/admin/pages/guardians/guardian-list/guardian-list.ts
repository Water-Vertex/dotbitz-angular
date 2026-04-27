import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuardianService } from '../../../../../services/guardian.service';
import { ToastService } from '../../../../../services/toast.service';
import { RouterModule, Router } from '@angular/router';
import { Guardian } from '../../../../../models/guardians.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-guardian-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './guardian-list.html',
  styleUrls: ['./guardian-list.css']
})
export class GuardianList implements OnInit, OnDestroy {
  guardians: Guardian[] = [];
  searchControl = new FormControl('');
  isLoading = false;

  private destroy$ = new Subject<void>();

  private guardianService = inject(GuardianService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadGuardians();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadGuardians());
  }

  loadGuardians(): void {
    this.isLoading = true;
    const term = this.searchControl.value || '';

    this.guardianService.getAllGuardians().subscribe({
      next: (res) => {
        this.guardians = res.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading guardians:', err);
        this.toast.error('Error', 'Failed to load guardians');
        this.isLoading = false;
      }
    });
  }

  refreshData() {
    this.loadGuardians();
  }

  

  trackById(index: number, item: Guardian): number {
    return item.id || index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
