import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramaticSeoService, ProgramaticSeo } from '../../../../../../services/programatic-seo.service';
import { ToastService } from '../../../../../../services/toast.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-programatic-seo-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CKEditorModule],
  templateUrl: './programatic-seo-add.html',
  styleUrl: './programatic-seo-add.css',
})
export class ProgramaticSeoAdd {
  seoForm: FormGroup;
  isSubmitting: boolean = false;
  
  // Image file handling
  selectedImage: File | null = null;
  selectedImageLeft: File | null = null;
  selectedImageRight: File | null = null;
  
  // Image previews
  imagePreview: string | ArrayBuffer | null = null;
  imageLeftPreview: string | ArrayBuffer | null = null;
  imageRightPreview: string | ArrayBuffer | null = null;

  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
      '|', 'link', 'bulletedList', 'numberedList',
      '|', 'blockQuote', '|', 'undo', 'redo',
    ],
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private programaticSeoService: ProgramaticSeoService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {
    this.seoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]],
      focus_keyword: ['', [Validators.required, Validators.maxLength(255)]],
      h1_heading: ['', Validators.maxLength(255)],
      meta_title: ['', Validators.maxLength(60)],
      meta_description: ['', Validators.maxLength(160)],
      meta_keywords: [''],
      meta_tags: [''],
      page_schema: [''],
      faqs: [''],
      content: [''],
      section_content_left: [''],
      section_content_right: [''],
      image_alt: [''],
      image_left_alt: [''],
      image_right_alt: ['']
    });
  }

  generateSlug(): void {
    const title = this.seoForm.get('title')?.value;
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      this.seoForm.patchValue({ slug });
    }
  }

  // Main Image handlers
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toast.error('Error', 'Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('Error', 'Image size should be less than 2MB.');
        return;
      }
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedImage = null;
    const fileInput = document.querySelector('input[type="file"][name="mainImage"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Left Image handlers
  onImageLeftSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toast.error('Error', 'Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('Error', 'Image size should be less than 2MB.');
        return;
      }
      this.selectedImageLeft = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageLeftPreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImageLeft(): void {
    this.imageLeftPreview = null;
    this.selectedImageLeft = null;
    const fileInput = document.querySelector('input[type="file"][name="leftImage"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Right Image handlers
  onImageRightSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toast.error('Error', 'Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.toast.error('Error', 'Image size should be less than 2MB.');
        return;
      }
      this.selectedImageRight = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageRightPreview = reader.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImageRight(): void {
    this.imageRightPreview = null;
    this.selectedImageRight = null;
    const fileInput = document.querySelector('input[type="file"][name="rightImage"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.seoForm.invalid) {
      this.markFormGroupTouched(this.seoForm);
      this.toast.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    // Append all form fields
    Object.keys(this.seoForm.value).forEach((key) => {
      let value = this.seoForm.value[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Append images
    if (this.selectedImage) {
      formData.append('image', this.selectedImage, this.selectedImage.name);
    }
    if (this.selectedImageLeft) {
      formData.append('image_left', this.selectedImageLeft, this.selectedImageLeft.name);
    }
    if (this.selectedImageRight) {
      formData.append('image_right', this.selectedImageRight, this.selectedImageRight.name);
    }

    this.programaticSeoService.create(formData).subscribe({
      next: (response) => {
        this.toast.success('Success', response.message || 'SEO record created successfully!');
        setTimeout(() => {
          this.router.navigate(['/admin/programatic-seo']);
        }, 1500);
      },
      error: (error) => {
        this.handleError(error);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  handleError(error: any): void {
    console.error('Error saving SEO record:', error);

    if (error.status === 422) {
      const errors = error.error?.errors;
      let errorMessages = 'Validation failed: \n';
      if (errors) {
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            errorMessages += `${key}: ${errors[key].join(', ')}\n`;
          }
        }
      }
      this.toast.error('Validation Error', errorMessages.trim());
      
      if (errors['slug']) {
        this.generateSlug();
      }
    } else if (error.status === 0) {
      this.toast.error('Network Error', 'Cannot connect to server.');
    } else if (error.status === 401) {
      this.toast.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      this.toast.error('Server Error', 'Internal server error.');
    } else {
      const errorMessage = error.error?.message || error.message || 'Failed to save SEO record.';
      this.toast.error('Error', errorMessage);
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
    this.router.navigate(['/admin/programatic-seo']);
  }

  // Helper methods for template
  get title() { return this.seoForm.get('title'); }
  get slug() { return this.seoForm.get('slug'); }
  get focus_keyword() { return this.seoForm.get('focus_keyword'); }
}