import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { McqService } from '../../../../../services/mcq.service';
import { Course } from '../../../../../models/course.model';
import { Mcq } from '../../../../../models/mcq.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mcqs-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './mcqs-add.html',
  styleUrls: ['./mcqs-add.css']
})
export class McqsAdd implements OnInit {
  mcqForm!: FormGroup;
  courses: Course[] = [];
  loading = false;
  coursesLoading = false;

  constructor(
    private fb: FormBuilder,
    private mcqService: McqService,
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
      issingle: [true, Validators.required],
      options: this.fb.array([this.createOption(), this.createOption()]),
      correctAnswers: this.fb.array([]),
      status: ['active', Validators.required]
    });
  }

  createOption(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required]
    });
  }

  // FormArray getters
  get mcqs(): FormArray {
    return this.mcqForm.get('mcqs') as FormArray;
  }

  optionsAt(i: number): FormArray {
    return this.mcqs.at(i).get('options') as FormArray;
  }

  correctAnswersAt(i: number): FormArray {
    return this.mcqs.at(i).get('correctAnswers') as FormArray;
  }

  isSingleAt(i: number): boolean {
    return this.mcqs.at(i).get('issingle')?.value;
  }

  addOption(i: number) {
    if (this.optionsAt(i).length < 10) {
      this.optionsAt(i).push(this.createOption());
    }
  }

  removeOption(i: number, j: number) {
    if (this.optionsAt(i).length > 2) {
      this.optionsAt(i).removeAt(j);
      const idx = this.correctAnswersAt(i).controls.findIndex(x => x.value === j);
      if (idx !== -1) this.correctAnswersAt(i).removeAt(idx);
    }
  }

  addMcq() {
    this.mcqs.push(this.createSingleMcq());
  }

  removeMcq(i: number) {
    if (this.mcqs.length > 1) {
      this.mcqs.removeAt(i);
    }
  }
  onSingleAnswerChange(mcqIndex: number, optionIndex: number) {
  const correctArr = this.correctAnswersAt(mcqIndex);
  correctArr.clear();
  correctArr.push(this.fb.control(optionIndex));
}


  onCorrectAnswerChange(mcqIndex: number, optionIndex: number, event: any) {
    const checked = event.target.checked;
    const correctArr = this.correctAnswersAt(mcqIndex);
    if (checked) {
      correctArr.push(this.fb.control(optionIndex));
    } else {
      const idx = correctArr.controls.findIndex(x => x.value === optionIndex);
      correctArr.removeAt(idx);
    }
  }

  isCorrectAnswer(mcqIndex: number, optionIndex: number): boolean {
    return this.correctAnswersAt(mcqIndex).controls.some(x => x.value === optionIndex);
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
        alert('Failed to load courses. Please try again.');
      }
    });
  }

  // onSubmit() {
  //   if (this.mcqForm.invalid) {
  //     alert('Please fill all required fields correctly');
  //     return;
  //   }

  //   const courseId = Number(this.mcqForm.value.course_id);

  //   const payload: Mcq[] = this.mcqs.controls.map(mcqControl => {
  //     const mcqValue = mcqControl.value;
  //     const opts = mcqValue.options.map((o: any) => o.value);

  //     let answer: string;
  //     if (mcqValue.issingle) {
  //       if (mcqValue.correctAnswers.length === 0) {
  //         throw alert('Please select a correct answer for each MCQ');
  //       }
  //       answer = opts[mcqValue.correctAnswers[0]];
  //     } else {
  //       if (mcqValue.correctAnswers.length === 0) {
  //         throw alert('Please select at least one correct answer for each MCQ');
  //       }
  //       answer = mcqValue.correctAnswers
  //         .sort((a: number, b: number) => a - b)
  //         .map((i: number) => opts[i])
  //         .join(',');
  //     }

  //     return {
  //       question: mcqValue.question,
  //       options: opts,
  //       answer: answer,
  //       course_id: courseId,
  //       status: mcqValue.status,
  //       issingle: mcqValue.issingle
  //     } as Mcq;
  //   });

  //   this.loading = true;
  //   this.mcqService.createMultipleMcqs(payload).subscribe({
  //     next: () => {
  //       alert('All MCQs created successfully!');
  //       this.router.navigate(['/admin/mcqs']);
  //     },
  //     error: (err:any) => {
  //       console.error(err);
  //       this.loading = false;
  //       alert('Failed to create MCQs');
  //     }
  //   });
  // }

onSubmit() {
  if (this.mcqForm.invalid) {
    alert('Please fill all required fields correctly');
    return;
  }

  const courseId = Number(this.mcqForm.value.course_id);

  const observables = this.mcqs.controls.map(mcqControl => {
    const mcqValue = mcqControl.value;
    const opts = mcqValue.options.map((o: any) => o.value);

    let answer: string;
    if (mcqValue.issingle) {
      if (mcqValue.correctAnswers.length === 0) {
        throw alert('Please select a correct answer for each MCQ');
      }
      answer = opts[mcqValue.correctAnswers[0]];
    } else {
      if (mcqValue.correctAnswers.length === 0) {
        throw alert('Please select at least one correct answer for each MCQ');
      }
      answer = mcqValue.correctAnswers
        .sort((a: number, b: number) => a - b)
        .map((i: number) => opts[i])
        .join(',');
    }

    const mcqData: Mcq = {
      question: mcqValue.question,
      options: opts,
      answer: answer,
      course_id: courseId,
      status: mcqValue.status,
      issingle: mcqValue.issingle
    };

    return this.mcqService.createMcq(mcqData);
  });

  this.loading = true;

  forkJoin(observables).subscribe({
    next: () => {
      alert('All MCQs created successfully!');
      this.router.navigate(['/admin/mcqs']);
    },
    error: (err: any) => {
      console.error('Error creating MCQs:', err);
      this.loading = false;
      alert('Failed to create MCQs');
    }
  });
}

}
