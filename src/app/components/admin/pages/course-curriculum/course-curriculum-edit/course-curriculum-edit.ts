
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseCurriculumService } from '../../../../../services/coursecurriculum.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/coursecurriculum.model';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-course-curriculum-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './course-curriculum-edit.html',
})
export class CourseCurriculumEdit implements OnInit, OnDestroy {
  curriculumForm: FormGroup;
  curriculumId: number | null = null;
  isLoading = true;
  isSubmitting = false;
  courses: Course[] = [];
  private routeSub: Subscription | undefined;

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
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
   
this.curriculumForm = this.fb.group({
  course_id: [null, Validators.required],
  course_hours: [''],    // ✅ ADD
  total_classes: [''],   // ✅ ADD
  title: ['', Validators.required],
  duration: [''],
  description: [''],
});
  }

  ngOnInit(): void {
    this.loadCourses();
    
    this.routeSub = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !isNaN(id)) {
        this.curriculumId = +id;
        this.loadCurriculum(this.curriculumId);
      } else {
        this.router.navigate(['/admin/course-curriculum/list']);
      }
    });
  }

  loadCourses(): void {
    this.curriculumService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || res || [];
        this.cdr.detectChanges();
      }
    });
  }

  loadCurriculum(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.curriculumService.getCurriculum(id).subscribe({
      next: (res: any) => {
        const data = res.data ? (Array.isArray(res.data) ? res.data[0] : res.data) : res;

        if (data) {
        
          this.curriculumForm.patchValue({
            course_id: data.course_id,
            title: data.title,
            duration: data.duration ? String(data.duration) : '',  
            description: data.description,
             course_hours: data.course_hours || '',      
  total_classes: data.total_classes || '',   
          });
          console.log("Data Loaded into Form:", data);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Load Error:", err);
        this.toastService.error('Error', 'Failed to load details');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.curriculumForm.invalid || !this.curriculumId) return;
    this.isSubmitting = true;
    const payload: any = {
      course_id: this.curriculumForm.value.course_id,
      title: this.curriculumForm.value.title,
      duration: this.curriculumForm.value.duration ? String(this.curriculumForm.value.duration) : null,  // ✅ Convert to string
      description: this.curriculumForm.value.description || ''
    };

    console.log('Updating payload:', payload);  // Debug

    this.curriculumService.updateCurriculum(this.curriculumId, payload).subscribe({
      next: (res: any) => {
        this.toastService.success('Success', 'Curriculum updated successfully');
        this.router.navigate(['/admin/course/curriculum/list']);
      },
      error: (err: any) => {
        console.error('Update Error:', err);
        this.toastService.error('Error', err.error?.message || 'Update failed');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/course/curriculum/list']);
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}