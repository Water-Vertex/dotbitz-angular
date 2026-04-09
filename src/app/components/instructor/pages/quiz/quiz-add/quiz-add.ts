import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { McqService } from '../../../../../services/mcq.service';

@Component({
  selector: 'app-instructor-quiz-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-add.html',
})
export class InstructorQuizAdd implements OnInit {

  courses: any[] = [];
  batches: any[] = [];
  mcqs: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;
  selectedMcqIds: number[] = [];

  name: string = '';
  marks: number | null = null;
  duration: number | null = null;
  status: string = 'draft';
  dueDate: string = '';

  loadingCourses = false;
  loadingBatches = false;
  loadingMcqs = false;
  submitting = false;

  constructor(
    private quizService: QuizService,
    private mcqService: McqService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.mcqService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCourses = false; }
    });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.batches = [];
    this.mcqs = [];
    this.selectedMcqIds = [];

    if (!this.selectedCourseId) return;

    // Batches
    this.loadingBatches = true;
    this.quizService.getInstructorBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res;
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });

    // MCQs
    this.loadingMcqs = true;
    this.quizService.getInstructorMcqsByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.mcqs = res.data || [];
        this.loadingMcqs = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingMcqs = false; }
    });
  }

  onMcqToggle(mcqId: number, event: any): void {
    if (event.target.checked) {
      this.selectedMcqIds.push(mcqId);
    } else {
      this.selectedMcqIds = this.selectedMcqIds.filter(id => id !== mcqId);
    }
  }

  isMcqSelected(mcqId: number): boolean {
    return this.selectedMcqIds.includes(mcqId);
  }

  onSubmit(): void {
    if (!this.name || !this.selectedCourseId || !this.selectedBatchId || !this.dueDate) {
      alert('Please fill all required fields.');
      return;
    }
    if (this.selectedMcqIds.length === 0) {
      alert('Please select at least one MCQ.');
      return;
    }

    this.submitting = true;

    const payload = {
      name:      this.name,
      marks:     this.marks,
      duration:  this.duration,
      status:    this.status,
      course_id: this.selectedCourseId,
      batch_id:  this.selectedBatchId,
      due_date:  this.dueDate,
      mcq_ids:   this.selectedMcqIds,
    };

    this.quizService.createInstructorQuiz(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Quiz created successfully!');
          this.router.navigate(['/instructor/quiz/list']);
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to create quiz.');
        console.error(err);
      }
    });
  }
}