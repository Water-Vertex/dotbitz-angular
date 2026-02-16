import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { McqService } from '../../../../../services/mcq.service';
import { Course } from '../../../../../models/course.model';
import { Mcq } from '../../../../../models/mcq.model';

@Component({
  selector: 'app-mcq-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mcq-edit.html',
  styleUrls: ['./mcq-edit.css']
})
export class McqsEdit implements OnInit {
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
      course_id: ['', Validators.required],
      status: ['active', Validators.required],
      issingle: [true, Validators.required],
      options: this.fb.array([]),
      correctAnswers: this.fb.array([])
    });

    this.mcqForm.get('issingle')?.valueChanges.subscribe(() => {
      this.correctAnswers.clear();
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

  get correctAnswers(): FormArray {
    return this.mcqForm.get('correctAnswers') as FormArray;
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
          question: mcq.question,
          course_id: mcq.course_id,
          status: mcq.status,
          issingle: mcq.issingle
        });

        // Load options
        this.options.clear();
        mcq.options.forEach(opt => this.options.push(this.createOption(opt)));

        // Load correct answers
        const correctIndexes = this.getCorrectIndexes(mcq);
        correctIndexes.forEach(i => this.correctAnswers.push(this.fb.control(i)));

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

  // Determine correct answer indexes from stored answer string
  getCorrectIndexes(mcq: Mcq): number[] {
    if (!mcq.answer) return [];
    const answers = mcq.answer.split(',');
    return mcq.options
      .map((opt, idx) => answers.includes(opt) ? idx : -1)
      .filter(idx => idx !== -1);
  }

  addOption() {
    if (this.options.length < 10) this.options.push(this.createOption());
  }

  removeOption(index: number) {
    if (this.options.length > 2) {
      this.options.removeAt(index);
      const idx = this.correctAnswers.controls.findIndex(x => x.value === index);
      if (idx !== -1) this.correctAnswers.removeAt(idx);
    }
  }

  onCorrectAnswerChange(index: number, event: any) {
    const checked = event.target.checked;
    if (checked) this.correctAnswers.push(this.fb.control(index));
    else {
      const idx = this.correctAnswers.controls.findIndex(x => x.value === index);
      if (idx !== -1) this.correctAnswers.removeAt(idx);
    }
  }

  isCorrectAnswer(index: number): boolean {
    return this.correctAnswers.controls.some(x => x.value === index);
  }

  get isSingle() {
    return this.mcqForm.get('issingle')?.value;
  }

  onSubmit() {
    Object.keys(this.mcqForm.controls).forEach(key => {
      this.mcqForm.get(key)?.markAsTouched();
    });

    if (this.mcqForm.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    const formValue = this.mcqForm.value;
    const options = formValue.options.map((opt: any) => opt.value);

    let answer: string;
    if (formValue.issingle) {
      const selectedRadio = document.querySelector(
        'input[name="correctAnswer"]:checked'
      ) as HTMLInputElement;

      if (!selectedRadio) {
        alert('Please select the correct answer');
        return;
      }

      answer = options[parseInt(selectedRadio.value, 10)];
    } else {
      if (formValue.correctAnswers.length === 0) {
        alert('Please select at least one correct answer');
        return;
      }

      answer = formValue.correctAnswers
        .sort((a: number, b: number) => a - b)
        .map((i: number) => options[i])
        .join(',');
    }

    const mcqData: Mcq = {
      question: formValue.question,
      options: options,
      answer: answer,
      course_id: Number(formValue.course_id),
      status: formValue.status === 'active' ? 'active' : 'inactive',
      issingle: Boolean(formValue.issingle)
    };

    this.loading = true;
    this.mcqService.updateMcq(this.mcqId, mcqData).subscribe({
      next: (res) => {
        alert('MCQ updated successfully!');
        this.router.navigate(['/admin/mcqs']);
      },
      error: (err) => {
        console.error('Error updating MCQ:', err);
        this.loading = false;
        alert('Failed to update MCQ.');
      }
    });
  }
}
