import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PolicyService } from '../../../../../services/policy.service';
import { ToastService } from '../../../../../services/toast.service';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-policy-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,QuillModule],
  templateUrl: './policy-edit.html',
  styleUrls: ['./policy-edit.css']
})
export class PolicyEdit implements OnInit, OnDestroy {
  policyForm: FormGroup;
  policyId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  private routeSub: Subscription | undefined;
   quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video'],
    ],
  };

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.policyForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      meta_title : [''],
      meta_tags : [''],
      meta_keywords : [''],
      meta_description : ['']
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];

      if (id && !isNaN(id)) {
        this.policyId = parseInt(id, 10);
        this.loadPolicy(this.policyId);
      } else {
        this.toastService.error('Error', 'Invalid Policy ID');
        this.router.navigate(['/admin/policy/list']);
      }
    });
  }

  loadPolicy(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // Force UI update

    this.policyService.getPolicy(id).subscribe({
      next: (response) => {
        // Handle the response structure
        let policyData = response;

        // If data is wrapped in a 'data' property
        if (response && response.data) {
          policyData = response.data;
        }

        // Check if we have valid Policy data
        if (!policyData || !policyData.id) {
          this.toastService.error('Error', 'Policy not found or invalid data received');
          this.router.navigate(['/admin/policy/list']);
          return;
        }

        // Patch form with Policy data
        this.policyForm.patchValue({
          title: policyData.title || '',
          description: policyData.description || '',
          meta_title: policyData.meta_title || '',
          meta_description: policyData.meta_description || '',
          meta_keywords: policyData.meta_keywords || '',
          meta_tags: policyData.meta_tags || '',
        });

        // Set loading to false and update view
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        let errorMessage = 'Failed to load Policy. Please try again.';

        if (error.status === 404) {
          errorMessage = 'Policy not found. It may have been deleted.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        this.toastService.error('Error', errorMessage);

        // Navigate back to list after error
        setTimeout(() => {
          this.router.navigate(['/admin/policy/list']);
        }, 2000);

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.policyForm.invalid) {
      this.markFormGroupTouched(this.policyForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    if (!this.policyId) {
      this.toastService.error('Error', 'Invalid Policy ID');
      return;
    }

    this.isSubmitting = true;
    const formData = this.policyForm.value;

    this.policyService.updatePolicy(this.policyId, formData).subscribe({
      next: (response) => {
        this.toastService.success('Success', 'Policy updated successfully!');
        setTimeout(() => {
          this.router.navigate(['/admin/policy/list']);
        }, 1500);
      },
      error: (error) => {
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
      if (errors) {
        let errorMessages = 'Validation failed: \n';
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            errorMessages += `${key}: ${errors[key].join(', ')}\n`;
          }
        }
        this.toastService.error('Validation Error', errorMessages.trim());
      }
    } else if (error.status === 0) {
      this.toastService.error('Network Error', 'Cannot connect to server. Check if Laravel server is running.');
    } else if (error.status === 404) {
      this.toastService.error('Not Found', 'Policy not found. It may have been deleted.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      this.toastService.error('Server Error', 'Internal server error. Check Laravel logs.');
    } else {
      const errorMessage = error.error?.message || error.message || 'Failed to update Policy. Please try again.';
      this.toastService.error('Error', errorMessage);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/policy/list']);
  }

  // Helper methods for template
  get title() { return this.policyForm.get('title'); }
  get description() { return this.policyForm.get('description'); }
  get meta_title() { return this.policyForm.get('meta_title'); }
  get meta_keywords() { return this.policyForm.get('meta_keywords'); }
  get meta_tags() { return this.policyForm.get('meta_tags'); }
  get meta_description() { return this.policyForm.get('meta_description'); }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
