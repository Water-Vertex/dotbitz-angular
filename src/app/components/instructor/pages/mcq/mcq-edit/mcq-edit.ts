import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { McqService } from '../../../../../services/mcq.service';
import { Course } from '../../../../../models/course.model';

@Component({
  selector: 'app-instructor-mcqs-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mcq-edit.html',
  styleUrls: ['./mcq-edit.css']
})
export class InstructorMcqsEdit implements OnInit {
  mcqForm!: FormGroup;
  courses: Course[] = [];
  loading = false;
  coursesLoading = false;
  mcqId!: number;
  answerError: boolean = false;

  constructor(
    private fb: FormBuilder,
    private mcqService: McqService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.mcqId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadCourses();
    this.loadMcq();
  }

  initForm() {
    this.mcqForm = this.fb.group({
      question:  ['', [Validators.required, Validators.minLength(10)]],
      answer:    ['', Validators.required],
      course_id: ['', Validators.required],
      status:    ['active', Validators.required],
      issingle:  [true, Validators.required],
      options:   this.fb.array([]),
      marks:     ['', Validators.required],
    });
  }

  createOption(value: string = ''): FormGroup {
    return this.fb.group({ value: [value, Validators.required] });
  }

  get options(): FormArray {
    return this.mcqForm.get('options') as FormArray;
  }

  validateAnswer(): boolean {
    const formValue = this.mcqForm.value;
    const opts = formValue.options.map((o: any) => o.value.trim().toLowerCase());
    const answers = formValue.answer.split(',').map((a: string) => a.trim().toLowerCase());
    this.answerError = !answers.every((ans: string) => opts.includes(ans));
    return !this.answerError;
  }

  // ✅ Sirf instructor ke assigned courses
  loadCourses() {
    this.coursesLoading = true;
    this.mcqService.getInstructorCourses().subscribe({
      next: (data: any) => {
        const all = Array.isArray(data) ? data : (data?.data ?? []);
        this.courses = all.filter((c: any) => c.status === 'active');
        this.coursesLoading = false;
      },
      error: () => {
        this.coursesLoading = false;
        alert('Failed to load courses.');
      }
    });
  }

  loadMcq() {
    this.loading = true;
    this.mcqService.getInstructorMcq(this.mcqId).subscribe({
      next: (mcq: any) => {
        this.mcqForm.patchValue({
          question:  mcq.question,
          answer:    mcq.answer,
          course_id: mcq.course_id,
          status:    mcq.status,
          issingle:  mcq.issingle,
          marks:     mcq.marks
        });

        this.options.clear();
        mcq.options.forEach((opt: string) => this.options.push(this.createOption(opt)));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load MCQ data');
        this.router.navigate(['/instructor/mcqs']);
      }
    });
  }

  addOption() {
    if (this.options.length < 10) this.options.push(this.createOption());
  }

  removeOption(index: number) {
    if (this.options.length > 2) this.options.removeAt(index);
  }

  onSubmit() {
    Object.keys(this.mcqForm.controls).forEach(key => {
      this.mcqForm.get(key)?.markAsTouched();
    });

    if (this.mcqForm.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    if (!this.validateAnswer()) {
      alert('Answer must match one of the options.');
      return;
    }

    const formValue = this.mcqForm.value;
    const mcqData = {
      question:  formValue.question,
      options:   formValue.options.map((opt: any) => opt.value),
      answer:    formValue.answer,
      course_id: Number(formValue.course_id),
      status:    formValue.status,
      issingle:  Boolean(formValue.issingle),
      marks:     formValue.marks
    };

    this.loading = true;
    this.mcqService.updateInstructorMcq(this.mcqId, mcqData).subscribe({
      next: () => {
        alert('MCQ updated successfully!');
        this.router.navigate(['/instructor/mcqs']);
      },
      error: () => {
        this.loading = false;
        alert('Failed to update MCQ.');
      }
    });
  }
}