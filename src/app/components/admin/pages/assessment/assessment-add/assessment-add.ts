import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../../../services/assessment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/assessment.model';

@Component({
  selector: 'app-assessment-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assessment-add.html',
})
export class AssessmentAdd implements OnInit {
  form!: FormGroup;
  courses: Course[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialize the component, build the form, and load initial data.
   */
  ngOnInit(): void {
    this.buildForm();
    this.loadCourses();
    this.addQuestion();
  }

  /**
   * Configure the main Reactive Form structure.
   */
  private buildForm(): void {
    this.form = this.fb.group({
      course_id: [null, Validators.required],
      assessment_title: ['', Validators.required],
      questions: this.fb.array([]),
    });
  }

  // ================= QUESTIONS ARRAY MANAGEMENT =================

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  /**
   * Append a new question group to the questions FormArray.
   */
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

  /**
   * Remove a question from the array by its index.
   */
  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  /**
   * Calculate the sum of marks for all questions in the form.
   */
  get totalMarks(): number {
    return this.questions.controls
      .map((q) => q.get('marks')?.value || 0)
      .reduce((acc, curr) => acc + curr, 0);
  }

  // ================= OPTIONS MANAGEMENT =================

  getOptions(qIndex: number): FormArray {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  /**
   * Add a new option control to a specific question.
   */
  addOption(qIndex: number): void {
    this.getOptions(qIndex).push(this.fb.control('', Validators.required));
  }

  /**
   * Remove an option from a specific question by its index.
   */
  removeOption(qIndex: number, optIndex: number): void {
    this.getOptions(qIndex).removeAt(optIndex);
  }

  // ================= HELPERS & API CALLS =================

  /**
   * Handle UI logic when switching between MCQ and Q/A types.
   */
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

  /**
   * Retrieve the list of available courses from the database.
   */
  loadCourses(): void {
    this.assessmentService.getCourses().subscribe((courses) => {
      this.courses = courses;
    });
  }

  /**
   * Validate form and submit the assessment payload to the server.
   */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    this.assessmentService.createAssessment(this.form.value).subscribe({
      next: () => {
        this.toast.success('Success', 'Assessment added successfully');
        this.router.navigate(['/admin/assessments/list']);
      },
      error: () => {
        this.toast.error('Error', 'Failed to save assessment');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Cancel the operation and return to the list view.
   */
  cancel(): void {
    this.router.navigate(['/admin/assessments/list']);
  }
}
