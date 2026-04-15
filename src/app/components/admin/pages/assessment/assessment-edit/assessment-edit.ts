import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../../../../../services/assessment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/assessment.model';

@Component({
  selector: 'app-assessment-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assessment-edit.html',
})
export class AssessmentEdit implements OnInit {
  form!: FormGroup;
  courses: Course[] = [];
  isSubmitting = false;
  isLoading = false;
  assessmentId!: number;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadCourses();
    this.loadAssessment();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      course_id: [null, Validators.required],
      assessment_title: ['', Validators.required],
      due_date: ['', Validators.required],
      questions: this.fb.array([]),
    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  addQuestion(): void {
    this.questions.push(
      this.fb.group({
        assessment_type: ['mcqs', Validators.required],
        question: ['', [Validators.required, Validators.minLength(5)]],
        answer: ['', Validators.required],
        marks: [0, [Validators.required, Validators.min(0)]],
        is_single: [true],
        options: this.fb.array([
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required),
        ]),
      }),
    );
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    } else {
      this.toast.error('Cannot Remove', 'Assessment must have at least one question');
    }
  }

  get totalMarks(): number {
    return this.questions.controls
      .map((q) => q.get('marks')?.value || 0)
      .reduce((acc, curr) => acc + curr, 0);
  }

  getOptions(qIndex: number): FormArray {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  addOption(qIndex: number): void {
    this.getOptions(qIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, optIndex: number): void {
    if (this.getOptions(qIndex).length > 2) {
      this.getOptions(qIndex).removeAt(optIndex);
    } else {
      this.toast.error('Cannot Remove', 'MCQ must have at least 2 options');
    }
  }

  onTypeChange(qIndex: number): void {
    const question = this.questions.at(qIndex);
    const type = question.get('assessment_type')?.value;
    const options = question.get('options') as FormArray;

    if (type === 'q-a') {
      while (options.length !== 0) {
        options.removeAt(0);
      }
      options.clearValidators();
    } else {
      if (options.length === 0) {
        options.push(this.fb.control('', Validators.required));
        options.push(this.fb.control('', Validators.required));
      }
      options.setValidators(Validators.required);
    }
    options.updateValueAndValidity();
  }

  loadCourses(): void {
    this.assessmentService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to load courses');
      }
    });
  }

  loadAssessment(): void {
    this.isLoading = true;
    this.assessmentService.getAssessment(this.assessmentId).subscribe({
      next: (assessment: any) => {
        console.log('Loaded assessment:', assessment);
        this.populateForm(assessment);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Load error:', error);
        this.toast.error('Error', 'Failed to load assessment');
        this.router.navigate(['/admin/assessments/list']);
        this.isLoading = false;
      }
    });
  }

  private populateForm(assessment: any): void {
    // Set basic info
    this.form.patchValue({
      course_id: assessment.course_id,
      assessment_title: assessment.assessment_title,
      due_date: assessment.due_date ? this.formatDateForInput(assessment.due_date) : '',
    });

    // Clear existing questions
    while (this.questions.length) {
      this.questions.removeAt(0);
    }

    // Add questions from assessment
    if (assessment.questions && assessment.questions.length > 0) {
      assessment.questions.forEach((question: any) => {
        const questionGroup = this.fb.group({
          assessment_type: [question.assessment_type || 'mcqs', Validators.required],
          question: [question.question, [Validators.required, Validators.minLength(5)]],
          answer: [question.answer || '', Validators.required],
          marks: [question.marks || 0, [Validators.required, Validators.min(0)]],
          is_single: [question.is_single !== undefined ? question.is_single : true],
          options: this.fb.array([]),
        });

        // Add options if MCQ
        if (question.assessment_type === 'mcqs' && question.options && question.options.length > 0) {
          const optionsArray = questionGroup.get('options') as FormArray;
          question.options.forEach((option: string) => {
            optionsArray.push(this.fb.control(option, Validators.required));
          });
        }

        this.questions.push(questionGroup);
      });
    }

    // If no questions were added, add one default
    if (this.questions.length === 0) {
      this.addQuestion();
    }
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    const formValue = { ...this.form.value };
    if (formValue.due_date) {
      formValue.due_date = new Date(formValue.due_date).toISOString();
    }

    // Prepare payload with questions
    const payload = {
      course_id: formValue.course_id,
      assessment_title: formValue.assessment_title,
      due_date: formValue.due_date,
      questions: formValue.questions.map((q: any) => ({
        assessment_type: q.assessment_type,
        question: q.question,
        answer: q.answer,
        marks: parseFloat(q.marks) || 0,
        is_single: q.is_single,
        options: q.assessment_type === 'mcqs' ? (q.options || []).filter((opt: string) => opt.trim() !== '') : []
      }))
    };

    console.log('Submitting payload:', payload);

    // Use the service to update - if your service doesn't have a method for full assessment update,
    // you may need to add one. For now, we'll use the existing update method with a modified payload
    this.updateAssessment(payload);
  }

  /**
   * Update assessment using the service
   */
  private updateAssessment(payload: any): void {
    // If your backend expects the full assessment update with questions,
    // you might need to call a specific endpoint
    this.assessmentService.updateAssessment(this.assessmentId, payload).subscribe({
      next: () => {
        this.toast.success('Success', 'Assessment updated successfully');
        this.router.navigate(['/admin/assessments/list']);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.toast.error('Error', error.error?.message || 'Failed to update assessment');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/assessments/list']);
  }
}
