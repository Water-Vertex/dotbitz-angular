import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramaticSeoService, ProgramaticSeo } from '../../../../../../services/programatic-seo.service';
import { ToastService } from '../../../../../../services/toast.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-programatic-seo-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CKEditorModule],
  templateUrl: './programatic-seo-edit.html',
  styleUrl: './programatic-seo-edit.css',
})
export class ProgramaticSeoEdit implements OnInit {
  seoForm: FormGroup;
  loading = true;
  isSubmitting = false;
  recordId: number | null = null;

  // Image file handling
  selectedImage: File | null = null;
  selectedImageLeft: File | null = null;
  selectedImageRight: File | null = null;
  
  // Image previews
  imagePreview: string | ArrayBuffer | null = null;
  imageLeftPreview: string | ArrayBuffer | null = null;
  imageRightPreview: string | ArrayBuffer | null = null;

  // Existing image URLs
  existingImage: string | null = null;
  existingImageLeft: string | null = null;
  existingImageRight: string | null = null;

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
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.recordId = Number(id);
      this.loadRecord(this.recordId);
    } else {
      this.toast.error('Error', 'No record ID found');
      this.router.navigate(['/admin/programatic-seo']);
    }
  }

  loadRecord(id: number): void {
    this.loading = true;
    this.programaticSeoService.getById(id).subscribe({
      next: (response) => {
        if (response && response.success) {
          const record = response.data;
          
          // Patch form values
          this.seoForm.patchValue({
            title: record.title || '',
            slug: record.slug || '',
            focus_keyword: record.focus_keyword || '',
            h1_heading: record.h1_heading || '',
            meta_title: record.meta_title || '',
            meta_description: record.meta_description || '',
            meta_keywords: record.meta_keywords || '',
            meta_tags: record.meta_tags || '',
            page_schema: record.page_schema || '',
            faqs: record.faqs || '',
            content: record.content || '',
            section_content_left: record.section_content_left || '',
            section_content_right: record.section_content_right || '',
            image_alt: record.image_alt || '',
            image_left_alt: record.image_left_alt || '',
            image_right_alt: record.image_right_alt || ''
          });

          // Set existing image URLs for preview
          if (record.image) {
            if (record.image.startsWith('http')) {
              this.existingImage = record.image;
            } else {
              this.existingImage = `https://dotbitz.com/public/${record.image}`;
            }
            this.imagePreview = this.existingImage;
          }

          if (record.image_left) {
            if (record.image_left.startsWith('http')) {
              this.existingImageLeft = record.image_left;
            } else {
              this.existingImageLeft = `https://dotbitz.com/public/${record.image_left}`;
            }
            this.imageLeftPreview = this.existingImageLeft;
          }

          if (record.image_right) {
            if (record.image_right.startsWith('http')) {
              this.existingImageRight = record.image_right;
            } else {
              this.existingImageRight = `https://dotbitz.com/public/${record.image_right}`;
            }
            this.imageRightPreview = this.existingImageRight;
          }

          this.loading = false;
          this.cdr.detectChanges();
        } else {
          this.toast.error('Not Found', 'Record not found');
          setTimeout(() => this.goBack(), 2000);
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading record:', error);
        this.toast.error('Error', 'Failed to load record');
        this.loading = false;
        this.cdr.detectChanges();
      }
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
      this.existingImage = null; // Clear existing image when new is selected
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
    this.existingImage = null;
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
      this.existingImageLeft = null;
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
    this.existingImageLeft = null;
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
      this.existingImageRight = null;
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
    this.existingImageRight = null;
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

    if (!this.recordId) return;

    this.isSubmitting = true;
    const formData = new FormData();

    // Append all form fields
    Object.keys(this.seoForm.value).forEach((key) => {
      let value = this.seoForm.value[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Append images only if new ones are selected
    if (this.selectedImage) {
      formData.append('image', this.selectedImage, this.selectedImage.name);
    }
    if (this.selectedImageLeft) {
      formData.append('image_left', this.selectedImageLeft, this.selectedImageLeft.name);
    }
    if (this.selectedImageRight) {
      formData.append('image_right', this.selectedImageRight, this.selectedImageRight.name);
    }

    // Add flags to delete images if removed
    if (!this.existingImage && !this.selectedImage && this.imagePreview === null) {
      formData.append('remove_image', '1');
    }
    if (!this.existingImageLeft && !this.selectedImageLeft && this.imageLeftPreview === null) {
      formData.append('remove_image_left', '1');
    }
    if (!this.existingImageRight && !this.selectedImageRight && this.imageRightPreview === null) {
      formData.append('remove_image_right', '1');
    }

    formData.append('_method', 'PUT'); // Laravel method spoofing

    this.programaticSeoService.update(this.recordId, formData).subscribe({
      next: (response) => {
        this.toast.success('Success', response.message || 'SEO record updated successfully!');
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

  goBack(): void {
    this.router.navigate(['/admin/programatic-seo']);
  }

  cancel(): void {
    this.goBack();
  }

  // Helper methods for template
  get title() { return this.seoForm.get('title'); }
  get slug() { return this.seoForm.get('slug'); }
  get focus_keyword() { return this.seoForm.get('focus_keyword'); }
}