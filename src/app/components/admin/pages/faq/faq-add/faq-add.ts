import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FaqService } from '../../../../../services/faq.services';
import { FAQFormData } from '../../../../../models/faq.model';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-faq-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './faq-add.html',
  styleUrls: ['./faq-add.css']
})
export class FaqAdd implements OnInit {
  faqForm: FormGroup;
  isEditMode: boolean = false;
  faqId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private faqService: FaqService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.faqForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      answer: ['', [Validators.required, Validators.minLength(10)]],
      is_active: [true],
      display_order: [0]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.faqId = parseInt(id, 10);
        this.loadFAQ(this.faqId);
      }
    });
  }

  loadFAQ(id: number): void {
    this.isLoading = true;
    this.faqService.getFAQ(id).subscribe({
      next: (response) => {
        const faq = response.data;
        this.faqForm.patchValue({
          question: faq.question,
          answer: faq.answer,
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading FAQ:', error);
        this.toastService.error('Error', 'Failed to load FAQ. Please try again.');
        this.router.navigate(['/admin/faq/list']);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.faqForm.invalid) {
      this.markFormGroupTouched(this.faqForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    const formData: FAQFormData = this.faqForm.value;

    // Debug log
    console.log('Submitting FAQ form data:', {
      formData,
      isEditMode: this.isEditMode,
      faqId: this.faqId
    });

    if (this.isEditMode && this.faqId) {
      // Update FAQ
      this.faqService.updateFAQ(this.faqId, formData).subscribe({
        next: (response) => {
          console.log('Update successful:', response);
          this.toastService.success('Success', response.message || 'FAQ updated successfully!');
          setTimeout(() => {
            this.router.navigate(['/admin/faq/list']);
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
      // Create FAQ
      this.faqService.createFAQ(formData).subscribe({
        next: (response) => {
          console.log('Create successful:', response);
          this.toastService.success('Success', response.message || 'FAQ created successfully!');
          setTimeout(() => {
            this.router.navigate(['/admin/faq/list']);
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
    console.error('Error saving FAQ:', {
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
      const errorMessage = error.error?.message || error.message || 'Failed to save FAQ. Please try again.';
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
    this.router.navigate(['/admin/faq/list']);
  }

  // Helper methods for template
  get question() { return this.faqForm.get('question'); }
  get answer() { return this.faqForm.get('answer'); }
}
