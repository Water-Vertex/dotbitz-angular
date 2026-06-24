import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoleService } from '../../../../../services/role.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './role-edit.html',
  styleUrls: ['./role-edit.css']
})
export class RoleEdit implements OnInit, OnDestroy {
  roleForm: FormGroup;
  roleId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  private routeSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && !isNaN(id)) {
        this.roleId = parseInt(id, 10);
        this.loadRole(this.roleId);
      } else {
        this.toastService.error('Error', 'Invalid Role ID');
        this.router.navigate(['/admin/roles/list']);
      }
    });
  }

  loadRole(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.roleService.getRole(id).subscribe({
      next: (response: any) => {
        const roleData = response?.data || response;
        if (!roleData || !roleData.name) {
          this.toastService.error('Error', 'Role not found');
          this.router.navigate(['/admin/roles/list']);
          return;
        }
        this.roleForm.patchValue({ name: roleData.name });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.toastService.error('Error', 'Failed to load role.');
        setTimeout(() => this.router.navigate(['/admin/roles/list']), 2000);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }
    if (!this.roleId) return;

    this.isSubmitting = true;
    this.roleService.updateRole(this.roleId, this.roleForm.value).subscribe({
      next: (response: any) => {
        this.toastService.success('Success', response?.message || 'Role updated successfully!');
        setTimeout(() => this.router.navigate(['/admin/roles/list']), 1500);
      },
      error: (error: any) => {
        this.handleError(error);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleError(error: any): void {
    if (error.status === 422) {
      const errors = error.error?.errors;
      let msg = 'Validation failed: ';
      if (errors) {
        for (const key in errors) {
          msg += `${key}: ${errors[key].join(', ')} `;
        }
      }
      this.toastService.error('Validation Error', msg.trim());
    } else if (error.status === 404) {
      this.toastService.error('Not Found', 'Role not found.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else {
      this.toastService.error('Error', error.error?.message || 'Failed to update role.');
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => control.markAsTouched());
  }

  cancel(): void {
    this.router.navigate(['/admin/roles/list']);
  }

  get name() { return this.roleForm.get('name'); }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}