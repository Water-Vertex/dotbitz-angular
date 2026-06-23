import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoleService } from '../../../../../services/role.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-role-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './role-add.html',
  styleUrls: ['./role-add.css']
})
export class RoleAdd implements OnInit {
  roleForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    this.roleService.createRole(this.roleForm.value).subscribe({
      next: (response: any) => {
        this.toastService.success('Success', response?.message || 'Role created successfully!');
        setTimeout(() => this.router.navigate(['/admin/roles/list']), 1500);
      },
      error: (error: any) => {
        this.handleError(error);
        this.isSubmitting = false;
      },
      complete: () => { this.isSubmitting = false; }
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
    } else if (error.status === 0) {
      this.toastService.error('Network Error', 'Cannot connect to server.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else {
      this.toastService.error('Error', error.error?.message || 'Failed to create role.');
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/roles/list']);
  }

  get name() { return this.roleForm.get('name'); }
}