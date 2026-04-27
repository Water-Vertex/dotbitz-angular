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
  filteredMcqs: any[] = [];
  mcqSearch: string = '';

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;
  selectedMcqIds: number[] = [];

  name: string = '';
  marks: number | null = null;
  duration: number | null = null;
  status: string = 'draft';
  dueDate: string = '';
  startDate: string = '';

  loadingCourses = false;
  loadingBatches = false;
  loadingMcqs = false;
  submitting = false;

  totalCalculatedMarks: number = 0;
  autoCalculateMarks: boolean = true;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private mcqService: McqService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    // ✅ Instructor assigned courses
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
    this.filteredMcqs = [];
    this.selectedMcqIds = [];
    this.mcqSearch = '';
    this.totalCalculatedMarks = 0;
    if (this.autoCalculateMarks) this.marks = null;
    if (!this.selectedCourseId) return;

    this.loadingBatches = true;
    this.quizService.getInstructorBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res;
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });

    this.loadingMcqs = true;
    this.quizService.getInstructorMcqsByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.mcqs = res.data || [];
        this.filteredMcqs = [...this.mcqs];
        this.loadingMcqs = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingMcqs = false; }
    });
  }

  onMcqSearch(): void {
    const query = this.mcqSearch.toLowerCase().trim();
    this.filteredMcqs = query
      ? this.mcqs.filter(m => m.question.toLowerCase().includes(query))
      : [...this.mcqs];
  }

  onMcqToggle(mcqId: number, event: any): void {
    const mcq = this.mcqs.find(m => m.id === mcqId);
    if (!mcq) return;
    const mcqMarks = parseFloat(mcq.marks) || 1;

    if (event.target.checked) {
      this.selectedMcqIds.push(mcqId);
      this.totalCalculatedMarks = Math.round((this.totalCalculatedMarks + mcqMarks) * 100) / 100;
    } else {
      this.selectedMcqIds = this.selectedMcqIds.filter(id => id !== mcqId);
      this.totalCalculatedMarks = Math.round((this.totalCalculatedMarks - mcqMarks) * 100) / 100;
    }

    if (this.autoCalculateMarks) this.marks = this.totalCalculatedMarks;
  }

  isMcqSelected(mcqId: number): boolean {
    return this.selectedMcqIds.includes(mcqId);
  }

  toggleAutoCalculate(): void {
    this.autoCalculateMarks = !this.autoCalculateMarks;
    if (this.autoCalculateMarks) this.marks = this.totalCalculatedMarks;
  }

  selectAllMcqs(): void {
    this.filteredMcqs.forEach(mcq => {
      if (!this.selectedMcqIds.includes(mcq.id)) {
        this.selectedMcqIds.push(mcq.id);
        this.totalCalculatedMarks = Math.round((this.totalCalculatedMarks + (parseFloat(mcq.marks) || 1)) * 100) / 100;
      }
    });
    if (this.autoCalculateMarks) this.marks = this.totalCalculatedMarks;
  }

  deselectAllMcqs(): void {
    this.selectedMcqIds = [];
    this.totalCalculatedMarks = 0;
    if (this.autoCalculateMarks) this.marks = null;
  }

  onSubmit(): void {
    if (!this.name?.trim()) { alert('Please enter quiz name.'); return; }
    if (!this.selectedCourseId) { alert('Please select a course.'); return; }
    if (!this.selectedBatchId) { alert('Please select a batch.'); return; }
    if (!this.startDate) { alert('Please select start date.'); return; }
    if (!this.dueDate) { alert('Please select due date.'); return; }
    if (this.selectedMcqIds.length === 0) { alert('Please select at least one MCQ.'); return; }
    if (!this.marks || this.marks <= 0) { alert('Please enter valid total marks.'); return; }

    this.submitting = true;

    const payload = {
      name:      this.name.trim(),
      marks:     this.marks,
      duration:  this.duration,
      status:    this.status,
      course_id: this.selectedCourseId,
      batch_id:  this.selectedBatchId,
      due_date:  this.dueDate,
      start_date: this.startDate || null,
      mcq_ids:   this.selectedMcqIds,
    };

    this.quizService.createInstructorQuiz(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Quiz created successfully!');
          this.router.navigate(['/instructor/quiz/list']);
        } else {
          alert(res.message || 'Failed to create quiz.');
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
