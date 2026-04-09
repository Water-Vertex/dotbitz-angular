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
      question: ['', [Validators.required, Validators.minLength(10)]],
      answer: ['', Validators.required],
      course_id: ['', Validators.required],
      status: ['active', Validators.required],
      issingle: [true, Validators.required],
      options: this.fb.array([]),
    });
  }

  createOption(value: string = ''): FormGroup {
    return this.fb.group({ value: [value, Validators.required] });
  }

  get options(): FormArray { return this.mcqForm.get('options') as FormArray; }

  loadCourses() {
    this.coursesLoading = true;
    // ✅ Sirf instructor ke assigned courses
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
        const data = mcq?.data ?? mcq;
        this.mcqForm.patchValue({
          question: data.question,
          answer: data.answer,
          course_id: data.course_id,
          status: data.status,
          issingle: data.issingle
        });

        this.options.clear();
        data.options.forEach((opt: string) => this.options.push(this.createOption(opt)));

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
    if (this.mcqForm.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    const formValue = this.mcqForm.value;
    const mcqData = {
      question: formValue.question,
      options: formValue.options.map((opt: any) => opt.value),
      answer: formValue.answer,
      course_id: Number(formValue.course_id),
      status: formValue.status,
      issingle: Boolean(formValue.issingle)
    };

    this.loading = true;
    // ✅ Instructor specific endpoint
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