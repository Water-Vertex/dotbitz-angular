import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FaqService } from '../../../../../services/faq.services';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-faq-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './faq-edit.html',
  styleUrls: ['./faq-edit.css']
})
export class FaqEdit implements OnInit, OnDestroy {
  faqForm: FormGroup;
  faqId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  private routeSub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private faqService: FaqService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.faqForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
      answer: ['', [Validators.required, Validators.minLength(10)]],
      is_active: [true],
      display_order: [0]
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      
      if (id && !isNaN(id)) {
        this.faqId = parseInt(id, 10);
        this.loadFAQ(this.faqId);
      } else {
        this.toastService.error('Error', 'Invalid FAQ ID');
        this.router.navigate(['/admin/faq/list']);
      }
    });
  }

  loadFAQ(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges(); // Force UI update
    
    this.faqService.getFAQ(id).subscribe({
      next: (response) => {
        // Handle the response structure
        let faqData = response;
        
        // If data is wrapped in a 'data' property
        if (response && response.data) {
          faqData = response.data;
        }
        
        // Check if we have valid FAQ data
        if (!faqData || !faqData.question) {
          this.toastService.error('Error', 'FAQ not found or invalid data received');
          this.router.navigate(['/admin/faq/list']);
          return;
        }
        
        // Patch form with FAQ data
        this.faqForm.patchValue({
          question: faqData.question || '',
          answer: faqData.answer || '',
          is_active: faqData.is_active !== undefined ? faqData.is_active : true,
          display_order: faqData.display_order || 0
        });
        
        // Set loading to false and update view
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        let errorMessage = 'Failed to load FAQ. Please try again.';
        
        if (error.status === 404) {
          errorMessage = 'FAQ not found. It may have been deleted.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.toastService.error('Error', errorMessage);
        
        // Navigate back to list after error
        setTimeout(() => {
          this.router.navigate(['/admin/faq/list']);
        }, 2000);
        
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.faqForm.invalid) {
      this.markFormGroupTouched(this.faqForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    if (!this.faqId) {
      this.toastService.error('Error', 'Invalid FAQ ID');
      return;
    }

    this.isSubmitting = true;
    const formData = this.faqForm.value;

    this.faqService.updateFAQ(this.faqId, formData).subscribe({
      next: (response) => {
        this.toastService.success('Success', 'FAQ updated successfully!');
        setTimeout(() => {
          this.router.navigate(['/admin/faq/list']);
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
      this.toastService.error('Not Found', 'FAQ not found. It may have been deleted.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      this.toastService.error('Server Error', 'Internal server error. Check Laravel logs.');
    } else {
      const errorMessage = error.error?.message || error.message || 'Failed to update FAQ. Please try again.';
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
    this.router.navigate(['/admin/faq/list']);
  }

  // Helper methods for template
  get question() { return this.faqForm.get('question'); }
  get answer() { return this.faqForm.get('answer'); }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}