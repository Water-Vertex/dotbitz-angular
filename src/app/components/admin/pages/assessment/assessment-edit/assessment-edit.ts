import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../../../../../services/assessment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course, Assessment } from '../../../../../models/assessment.model';

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
  originalAssessment: any = null;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  /**
   * Initialize the component, build the form, and load initial data.
   */
  ngOnInit(): void {
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadCourses();
    this.loadAssessment();
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
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    } else {
      this.toast.error('Cannot Remove', 'Assessment must have at least one question');
    }
  }

  /**
   * Calculate the sum of marks for all questions in the form.
   */
  get totalMarks(): number {
    return this.questions.controls
      .map((q) => {
        const marks = q.get('marks')?.value;
        return typeof marks === 'string' ? parseFloat(marks) : (marks || 0);
      })
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
    if (this.getOptions(qIndex).length > 2) {
      this.getOptions(qIndex).removeAt(optIndex);
    } else {
      this.toast.error('Cannot Remove', 'MCQ must have at least 2 options');
    }
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

  /**
   * Load assessment data for editing
   */
  loadAssessment(): void {
    this.isLoading = true;
    this.assessmentService.getAssessment(this.assessmentId).subscribe({
      next: (assessment: any) => {
        this.originalAssessment = assessment;
        this.populateForm(assessment);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error', 'Failed to load assessment');
        this.router.navigate(['/admin/assessments/list']);
        this.isLoading = false;
      }
    });
  }

  /**
   * Populate the form with assessment data
   */
  private populateForm(assessment: any): void {
    // Set basic info
    this.form.patchValue({
      course_id: assessment.course_id,
      assessment_title: assessment.assessment_title,
    });

    // Clear existing questions
    while (this.questions.length) {
      this.questions.removeAt(0);
    }

    // Add questions from assessment
    assessment.questions?.forEach((question: any) => {
      const questionGroup = this.fb.group({
        assessment_type: [question.assessment_type || 'mcqs', Validators.required],
        question: [question.question, [Validators.required, Validators.minLength(5)]],
        answer: [question.answer, Validators.required],
        marks: [question.marks, [Validators.required, Validators.min(0)]],
        is_single: [question.is_single !== undefined ? question.is_single : true],
        options: this.fb.array([]),
      });

      // Add options if MCQ
      if (question.assessment_type === 'mcqs' && question.options) {
        const optionsArray = questionGroup.get('options') as FormArray;
        question.options.forEach((option: string) => {
          optionsArray.push(this.fb.control(option, Validators.required));
        });
      } else {
        const optionsArray = questionGroup.get('options') as FormArray;
        optionsArray.clearValidators();
      }

      this.questions.push(questionGroup);
    });

    // If no questions were added, add one default
    if (this.questions.length === 0) {
      this.addQuestion();
    }
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
    const payload = this.preparePayload();

    this.assessmentService.updateAssessment(this.assessmentId, payload).subscribe({
      next: () => {
        this.toast.success('Success', 'Assessment updated successfully');
        this.router.navigate(['/admin/assessments/list']);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.toast.error('Error', 'Failed to update assessment');
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Prepare payload for API submission
   */
  private preparePayload(): any {
    const formValue = this.form.value;

    return {
      course_id: formValue.course_id,
      assessment_title: formValue.assessment_title,
      questions: formValue.questions.map((q: any) => ({
        assessment_type: q.assessment_type,
        question: q.question,
        answer: q.answer,
        marks: parseFloat(q.marks) || 0,
        is_single: q.is_single,
        options: q.assessment_type === 'mcqs' ? q.options : []
      }))
    };
  }

  /**
   * Cancel the operation and return to the list view.
   */
  cancel(): void {
    this.router.navigate(['/admin/assessments/list']);
  }
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
