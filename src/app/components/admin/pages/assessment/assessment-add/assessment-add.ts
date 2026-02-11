import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../../../../services/assessment.service';
import { ToastService } from '../../../../../services/toast.service';
import { Course } from '../../../../../models/assessment.model';

@Component({
  selector: 'app-assessment-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './assessment-add.html'
})
export class AssessmentAdd implements OnInit {

  form!: FormGroup;
  courses: Course[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCourses();
    this.addQuestion(); // default one question
  }

  // ================= FORM =================
  buildForm() {
    this.form = this.fb.group({
      course_id: [null, Validators.required],
      questions: this.fb.array([])
    });
  }

  // ================= QUESTIONS ARRAY =================
  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(
      this.fb.group({
        assessment_type: ['mcqs', Validators.required],
        question: ['', [Validators.required, Validators.minLength(5)]],
        answer: ['', Validators.required],
        is_single: [true],
        options: this.fb.array([
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required)
        ])
      })
    );
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  // ================= OPTIONS =================
  getOptions(qIndex: number): FormArray {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  addOption(qIndex: number) {
    this.getOptions(qIndex).push(
      this.fb.control('', Validators.required)
    );
  }

  removeOption(qIndex: number, optIndex: number) {
    this.getOptions(qIndex).removeAt(optIndex);
  }

  // ================= TYPE CHANGE =================
  onTypeChange(qIndex: number) {
    const question = this.questions.at(qIndex);
    const type = question.get('assessment_type')?.value;

    if (type === 'q-a') {
      question.get('options')?.reset();
      question.get('options')?.clearValidators();
    }
  }

  // ================= COURSES =================
  loadCourses() {
    this.assessmentService.getCourses().subscribe(courses => {
      this.courses = courses;
    });
  }

  // ================= SUBMIT =================
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Validation Error', 'Please fill all required fields');
      return;
    }

    this.isSubmitting = true;

    const payload = this.form.value;

    this.assessmentService.createAssessment(payload).subscribe({
      next: () => {
        this.toast.success('Success', 'Assessment added successfully');
        this.router.navigate(['/admin/assessments/list']);
      },
      error: () => {
        this.toast.error('Error', 'Failed to save assessment');
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/assessments/list']);
  }
}
