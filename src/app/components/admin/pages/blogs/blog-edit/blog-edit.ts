import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogService } from '../../../../../services/blog.service';
import { ToastService } from '../../../../../services/toast.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-blog-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './blog-edit.html',
  styleUrls: ['./blog-edit.css']
})
export class BlogEdit implements OnInit, OnDestroy {
  blogForm: FormGroup;
  blogId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  currentImage: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null; // Changed to match course component
  private routeSub: Subscription | undefined;

  public Editor: any = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading', '|', 'bold', 'italic', 'underline', 'strikethrough',
      '|', 'link', 'bulletedList', 'numberedList', 'imageUpload',
      '|', 'blockQuote', '|', 'undo', 'redo',
    ],
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.blogForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$')]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      meta_description: ['', Validators.maxLength(160)],
      meta_title: ['', Validators.maxLength(60)],
      meta_keywords: [''],
      meta_tags: [''],
      page_schemas: ['']
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      const id = params['id'];

      if (id && !isNaN(id)) {
        this.blogId = parseInt(id, 10);
        this.loadBlog(this.blogId);
      } else {
        this.toastService.error('Error', 'Invalid Blog ID');
        this.router.navigate(['/admin/blogs/list']);
      }
    });
  }

  loadBlog(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.blogService.getBlog(id).subscribe({
      next: (response: any) => {
        let blogData;

        // Handle different response structures
        if (response && response.data) {
          blogData = response.data;
        } else if (response && response.id) {
          blogData = response;
        } else if (response && response.success && response.data) {
          blogData = response.data;
        } else {
          this.toastService.error('Error', 'Invalid response format received');
          this.router.navigate(['/admin/blogs/list']);
          return;
        }

        // Check if we have valid blog data
        if (!blogData || !blogData.name) {
          this.toastService.error('Error', 'Blog post not found or invalid data received');
          this.router.navigate(['/admin/blogs/list']);
          return;
        }

        // Format page_schemas if it exists
        let pageSchemasValue = '';
        if (blogData.page_schemas) {
          try {
            if (typeof blogData.page_schemas === 'object') {
              pageSchemasValue = JSON.stringify(blogData.page_schemas, null, 2);
            } else if (typeof blogData.page_schemas === 'string') {
              const parsed = JSON.parse(blogData.page_schemas);
              pageSchemasValue = JSON.stringify(parsed, null, 2);
            }
          } catch (e) {
            pageSchemasValue = blogData.page_schemas;
          }
        }

        // Patch form with blog data
        this.blogForm.patchValue({
          name: blogData.name || '',
          slug: blogData.slug || '',
          description: blogData.description || '',
          meta_description: blogData.meta_description || '',
          meta_title: blogData.meta_title || '',
          meta_keywords: blogData.meta_keywords || '',
          meta_tags: blogData.meta_tags || '',
          page_schemas: pageSchemasValue
        });

        // Set current image
        if (blogData.image) {
          this.currentImage = blogData.image;
          // Set image preview for existing image
          if (blogData.image.startsWith('http')) {
            this.imagePreview = blogData.image;
          } else {
            this.imagePreview = `https://dotbitz.com/public/assets/images/blogs/${blogData.image}`;
          }
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        let errorMessage = 'Failed to load blog post. Please try again.';

        if (error.status === 404) {
          errorMessage = 'Blog post not found. It may have been deleted.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        this.toastService.error('Error', errorMessage);

        setTimeout(() => {
          this.router.navigate(['/admin/blogs/list']);
        }, 2000);

        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateSlug(): void {
    const name = this.blogForm.get('name')?.value;
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      this.blogForm.patchValue({ slug });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.toastService.error('Error', 'Please select a valid image file (JPG, PNG, WebP, GIF).');
        return;
      }

      // Validate file size (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastService.error('Error', 'Image size should be less than 2MB.');
        return;
      }

      this.selectedFile = file;

      // Create preview
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
    this.selectedFile = null;
    this.currentImage = null;

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.toastService.info('Image Removed', 'Featured image will be removed when saved.');
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    if (!this.blogId) {
      this.toastService.error('Error', 'Invalid Blog ID');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    // Append _method for PUT request
    formData.append('_method', 'PUT');

    // Iterate through form controls
    Object.keys(this.blogForm.value).forEach((key) => {
      let value = this.blogForm.value[key];

      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Handle image removal
    if (this.currentImage === null && !this.selectedFile) {
      formData.append('image', ''); // Send empty to remove image
    }

    // Append file if selected
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    // Debug log
    console.log('Submitting blog update:', {
      blogId: this.blogId,
      hasFile: !!this.selectedFile,
      formData: this.blogForm.value
    });

    // Update blog with file upload support
    this.blogService.updateBlogWithFile(this.blogId, formData).subscribe({
      next: (response) => {
        this.toastService.success('Success', response.message || 'Blog post updated successfully!');
        setTimeout(() => {
          this.router.navigate(['/admin/blogs/list']);
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
    console.error('Error updating blog:', error);

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

        if (errors['slug']) {
          this.generateSlug();
        }
      }
    } else if (error.status === 0) {
      this.toastService.error('Network Error', 'Cannot connect to server. Check if Laravel server is running.');
    } else if (error.status === 404) {
      this.toastService.error('Not Found', 'Blog post not found. It may have been deleted.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      this.toastService.error('Server Error', 'Internal server error. Check Laravel logs.');
    } else {
      const errorMessage = error.error?.message || error.message || 'Failed to update blog post. Please try again.';
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
    this.router.navigate(['/admin/blogs/list']);
  }

  // Helper methods for template
  get name() { return this.blogForm.get('name'); }
  get slug() { return this.blogForm.get('slug'); }
  get description() { return this.blogForm.get('description'); }
  get meta_title() { return this.blogForm.get('meta_title'); }
  get meta_description() { return this.blogForm.get('meta_description'); }
  get meta_keywords() { return this.blogForm.get('meta_keywords'); }
  get meta_tags() { return this.blogForm.get('meta_tags'); }
  get page_schemas() { return this.blogForm.get('page_schemas'); }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
