import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogService } from '../../../../../services/blog.service';
import { ToastService } from '../../../../../services/toast.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-blog-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, CKEditorModule],
  templateUrl: './blog-add.html',
  styleUrls: ['./blog-add.css']
})
export class BlogAdd implements OnInit {
  blogForm: FormGroup;
  isEditMode: boolean = false;
  blogId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null; // Changed to match course component

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
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.blogId = parseInt(id, 10);
        this.loadBlog(this.blogId);
      }
    });
  }

  // Custom validator for JSON
  jsonValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  loadBlog(id: number): void {
    this.isLoading = true;
    this.blogService.getBlog(id).subscribe({
      next: (response) => {
        const blog = response.data;
        this.blogForm.patchValue({
          name: blog.name,
          slug: blog.slug,
          description: blog.description,
          meta_description: blog.meta_description || '',
          meta_title: blog.meta_title || '',
          meta_keywords: blog.meta_keywords || '',
          meta_tags: blog.meta_tags || '',
          page_schemas: blog.page_schemas ? JSON.stringify(blog.page_schemas, null, 2) : ''
        });

        // Set image preview if exists
        if (blog.image) {
          // Check if image is a full URL or just a filename
          if (blog.image.startsWith('http')) {
            this.imagePreview = blog.image;
          } else {
            this.imagePreview = `https://dotbitz.com/public/assets/images/blogs/${blog.image}`;
          }
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading blog:', error);
        this.toastService.error('Error', 'Failed to load blog post. Please try again.');
        this.router.navigate(['/admin/blogs/list']);
        this.isLoading = false;
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
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Error', 'Please select an image file.');
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
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

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      this.markFormGroupTouched(this.blogForm);
      this.toastService.error('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();

    // Iterate through form controls
    Object.keys(this.blogForm.value).forEach((key) => {
      let value = this.blogForm.value[key];

      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Append file safely (like course component)
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    // Debug log
    console.log('Submitting blog form data:', {
      hasFile: !!this.selectedFile,
      isEditMode: this.isEditMode,
      blogId: this.blogId
    });

    if (this.isEditMode && this.blogId) {
      // Update blog with file upload support
      this.blogService.updateBlogWithFile(this.blogId, formData).subscribe({
        next: (response) => {
          this.toastService.success('Success', response.message || 'Blog updated successfully!');
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
    } else {
      // Create blog with file upload
      this.blogService.createBlogWithFile(formData).subscribe({
        next: (response) => {
          this.toastService.success('Success', response.message || 'Blog created successfully!');
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
  }

  handleError(error: any): void {
    console.error('Error saving blog:', error);

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

      this.toastService.error('Validation Error', errorMessages.trim());

      if (errors['slug']) {
        this.generateSlug();
      }
    } else if (error.status === 0) {
      this.toastService.error('Network Error', 'Cannot connect to server. Check if Laravel server is running.');
    } else if (error.status === 401) {
      this.toastService.error('Unauthorized', 'Please login again.');
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      this.toastService.error('Server Error', 'Internal server error. Check Laravel logs.');
    } else {
      const errorMessage = error.error?.message || error.message || 'Failed to save blog. Please try again.';
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
  get page_schemas() { return this.blogForm.get('page_schemas'); }
}
