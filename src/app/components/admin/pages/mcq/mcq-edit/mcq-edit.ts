import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { McqService } from '../../../../../services/mcq.service';
import { Course } from '../../../../../models/course.model';
import { Mcq } from '../../../../../models/mcq.model';

@Component({
  selector: 'app-mcqs-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mcq-edit.html',
  styleUrls: ['./mcq-edit.css']
})
export class McqsEdit implements OnInit {
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
      question:   ['', [Validators.required, Validators.minLength(10)]],
      answer:     ['', Validators.required],   // ✅ answer field add
      course_id:  ['', Validators.required],
      status:     ['active', Validators.required],
      issingle:   [true, Validators.required],
      options:    this.fb.array([]),
      marks:      ['', Validators.required],
    });
  }

  createOption(value: string = ''): FormGroup {
    return this.fb.group({
      value: [value, Validators.required]
    });
  }

  get options(): FormArray {
    return this.mcqForm.get('options') as FormArray;
  }

  get isSingle() {
    return this.mcqForm.get('issingle')?.value;
  }

validateAnswer(): boolean {
  const formValue = this.mcqForm.value;
  const opts = formValue.options.map((o: any) => o.value.trim().toLowerCase());
  const answers = formValue.answer.split(',').map((a: string) => a.trim().toLowerCase());
  this.answerError = !answers.every((ans: string) => opts.includes(ans));
  return !this.answerError;
}

  loadCourses() {
    this.coursesLoading = true;
    this.mcqService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data.filter(c => c.status === 'active');
        this.coursesLoading = false;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.coursesLoading = false;
        alert('Failed to load courses.');
      }
    });
  }

  loadMcq() {
    this.loading = true;
    this.mcqService.getMcq(this.mcqId).subscribe({
      next: (mcq) => {
        this.mcqForm.patchValue({
          question:  mcq.question,
          answer:    mcq.answer,     // ✅ answer autofill
          course_id: mcq.course_id,
          status:    mcq.status,
          issingle:  mcq.issingle,
          marks:     mcq.marks
        });

        // Options load karo
        this.options.clear();
        mcq.options.forEach(opt => this.options.push(this.createOption(opt)));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching MCQ:', err);
        this.loading = false;
        alert('Failed to load MCQ data');
        this.router.navigate(['/admin/mcqs']);
      }
    });
  }

  addOption() {
    if (this.options.length < 10) {
      this.options.push(this.createOption());
    }
  }

  removeOption(index: number) {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
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
    const options = formValue.options.map((opt: any) => opt.value);

    const mcqData: Mcq = {
      question:  formValue.question,
      options:   options,
      answer:    formValue.answer,         // ✅ seedha answer field se
      course_id: Number(formValue.course_id),
      status:    formValue.status,
      issingle:  Boolean(formValue.issingle),
      marks:     formValue.marks
    };

    this.loading = true;
    this.mcqService.updateMcq(this.mcqId, mcqData).subscribe({
      next: () => {
        alert('MCQ updated successfully!');
        this.router.navigate(['/admin/mcqs/list']);
      },
      error: (err) => {
        console.error('Error updating MCQ:', err);
        this.loading = false;
        alert('Failed to update MCQ.');
      }
    });
  }
}
