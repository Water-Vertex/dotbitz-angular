
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/coursecurriculum.model';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-course-curriculum-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './course-curriculum-add.html',
})
export class CourseCurriculumAdd implements OnInit {
  form: FormGroup;
  isLoading = true;
  isSubmitting = false;
  courses: Course[] = [];

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  constructor(
    private fb: FormBuilder,
    private curriculumService: CourseCurriculumService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      course_id: ['', Validators.required],
      items: this.fb.array([this.createItem()]),
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      duration: [''],  
      description: [''],
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) this.items.removeAt(index);
  }

  get canSave(): boolean {
    const courseSelected = !!this.form.get('course_id')?.value;
    const hasTitle = this.items.controls.some(c => c.get('title')?.value?.trim());
    return courseSelected && hasTitle;
  }

  loadCourses(): void {
    this.curriculumService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || res || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Error', 'Failed to load courses');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.canSave) return;
    this.isSubmitting = true;

    const payload = {
      course_id: this.form.get('course_id')?.value,
      items: this.items.value.filter((i: any) => i.title.trim()).map((item: any, index: number) => ({
        title: item.title,
        duration: item.duration ? String(item.duration) : null,  
        description: item.description || '',
        sorting_order: index + 1
      }))
    };

    console.log('Sending payload:', payload);  // Debug ke liye

    this.curriculumService.createCurriculum(payload).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', 'Curriculum created successfully');
        this.router.navigate(['/admin/course/curriculum/list']);
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastService.error('Error', err.error?.message || 'Failed');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/course/curriculum/list']);
  }
}