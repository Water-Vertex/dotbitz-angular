import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { McqService } from '../../../../../services/mcq.service';
import { Course } from '../../../../../models/course.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-instructor-mcqs-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mcq-add.html',
  styleUrls: ['./mcq-add.css']
})
export class InstructorMcqsAdd implements OnInit {
  mcqForm!: FormGroup;
  courses: Course[] = [];
  loading = false;
  coursesLoading = false;

  constructor(
    private fb: FormBuilder,
    private mcqService: McqService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCourses();
  }

  initForm() {
    this.mcqForm = this.fb.group({
      course_id: ['', Validators.required],
      mcqs: this.fb.array([this.createSingleMcq()])
    });
  }

  createSingleMcq(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required, Validators.minLength(10)]],
      answer: ['', Validators.required],
      issingle: [true, Validators.required],
      options: this.fb.array([this.createOption(), this.createOption()]),
      correctAnswers: this.fb.array([]),
      status: ['active', Validators.required]
    });
  }

  createOption(): FormGroup {
    return this.fb.group({ value: ['', Validators.required] });
  }

  get mcqs(): FormArray { return this.mcqForm.get('mcqs') as FormArray; }
  optionsAt(i: number): FormArray { return this.mcqs.at(i).get('options') as FormArray; }
  correctAnswersAt(i: number): FormArray { return this.mcqs.at(i).get('correctAnswers') as FormArray; }

  addOption(i: number) {
    if (this.optionsAt(i).length < 10) this.optionsAt(i).push(this.createOption());
  }

  removeOption(i: number, j: number) {
    if (this.optionsAt(i).length > 2) this.optionsAt(i).removeAt(j);
  }

  addMcq() { this.mcqs.push(this.createSingleMcq()); }

  removeMcq(i: number) {
    if (this.mcqs.length > 1) this.mcqs.removeAt(i);
  }

  loadCourses() {
    this.coursesLoading = true;
    // ✅ Sirf instructor ke assigned courses
    this.mcqService.getInstructorCourses().subscribe({
      next: (data: any) => {
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        this.courses = all.filter((c: any) => c.status === 'active');
        this.coursesLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.coursesLoading = false;
        this.cdr.detectChanges();
        alert('Failed to load courses.');
      }
    });
  }

  onSubmit() {
    if (this.mcqForm.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    const courseId = Number(this.mcqForm.value.course_id);

    const observables = this.mcqs.controls.map(mcqControl => {
      const mcqValue = mcqControl.value;
      const opts = mcqValue.options.map((o: any) => o.value);

      return this.mcqService.createInstructorMcq({
        question: mcqValue.question,
        options: opts,
        answer: mcqValue.answer,
        course_id: courseId,
        status: mcqValue.status,
        issingle: mcqValue.issingle
      });
    });

    this.loading = true;
    forkJoin(observables).subscribe({
      next: () => {
        alert('All MCQs created successfully!');
        this.router.navigate(['/instructor/mcqs']);
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        alert('Failed to create MCQs');
      }
    });
  }
}