import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PolicyService } from '../../../../../services/policy.service';
import { PolicyFormData } from '../../../../../models/policy.model';
import { ToastService } from '../../../../../services/toast.service';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-policy-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './policy-add.html',
  styleUrls: ['./policy-add.css']
})
export class PolicyAdd implements OnInit {
  policyForm: FormGroup;
  isEditMode: boolean = false;
  policyId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
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
    private polucyService: PolicyService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
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
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.policyId = parseInt(id, 10);
        this.loadPolicy(this.policyId);
      }
    });
  }

  loadPolicy(id: number): void {
    this.isLoading = true;
    this.polucyService.getPolicy(id).subscribe({
      next: (response) => {
        const policy = response.data;
        this.policyForm.patchValue({
          title: policy.title,
          description: policy.description,
          meta_title: policy.meta_title,
          meta_description: policy.meta_description,
          meta_keywords: policy.meta_keywords,
          meta_tags: policy.meta_tags,
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Policy:', error);
        this.toastService.error('Error', 'Failed to load Policy. Please try again.');
        this.router.navigate(['/admin/policy/list']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.policyForm.invalid) {
      this.markFormGroupTouched(this.policyForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    const formData: PolicyFormData = this.policyForm.value;

    // Debug log
    console.log('Submitting Policy form data:', {
      formData,
      isEditMode: this.isEditMode,
      policyId: this.policyId
    });

    if (this.isEditMode && this.policyId) {
      // Update Policy
      this.polucyService.updatePolicy(this.policyId, formData).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.toastService.success('Success', response.message || 'Policy updated successfully!');
          setTimeout(() => {
            this.router.navigate(['/admin/policy/list']);
          }, 1500);
        },
        error: (error) => {
          this.handleError(error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // Create Policy
      this.polucyService.createPolicy(formData).subscribe({
        next: (response) => {
          console.log('Create successful:', response);
          this.toastService.success('Success', response.message || 'Policy created successfully!');
          setTimeout(() => {
            this.router.navigate(['/admin/policy/list']);
          }, 1500);
        },
        error: (error) => {
          this.handleError(error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  handleError(error: any): void {
    console.error('Error saving Policy:', {
      status: error?.status,
      statusText: error?.statusText,
      error: error?.error,
      message: error?.message,
      url: error?.url
    });

    if (error.status === 422) {
      // Laravel validation errors
      const errors = error.error?.errors;
      let errorMessages = 'Validation failed: \n';

      if (errors) {
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            errorMessages += `${key}: ${errors[key].join(', ')}\n`;
          }
        }
      }

      this.toastService.error('Validation Error', errorMessages.trim());
    } else if (error.status === 0) {
      this.toastService.error('Network Error', 'Cannot connect to server. Check if Laravel server is running.');
    } else if (error.status === 404) {
      this.toastService.error('Not Found', 'API endpoint not found. Check server URL.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      this.toastService.error('Server Error', 'Internal server error. Check Laravel logs.');
    } else {
      const errorMessage = error.error?.message || error.message || 'Failed to save Policy. Please try again.';
      this.toastService.error('Error', errorMessage);
    }

    this.isSubmitting = false;
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
}
