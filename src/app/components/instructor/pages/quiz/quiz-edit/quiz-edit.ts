import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { McqService } from '../../../../../services/mcq.service';

@Component({
  selector: 'app-instructor-quiz-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-edit.html',
})
export class InstructorQuizEdit implements OnInit {

  quizId!: number;
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
  loadingQuiz = false;
  submitting = false;

  totalCalculatedMarks: number = 0;
  autoCalculateMarks: boolean = true;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute,
    private mcqService: McqService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.mcqService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.loadQuiz();
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCourses = false; }
    });
  }

  loadQuiz(): void {
    this.loadingQuiz = true;
    this.quizService.getInstructorQuiz(this.quizId).subscribe({
      next: (res: any) => {
        const quiz = res.data;
        this.name             = quiz.name;
        this.marks            = quiz.marks;
        this.duration         = quiz.duration;
        this.status           = quiz.status;
        this.dueDate          = this.formatDate(quiz.due_date);
        this.selectedCourseId = quiz.course_id;
        this.selectedBatchId  = quiz.batch_id;
        this.selectedMcqIds   = quiz.mcqs.map((m: any) => m.id);
        this.loadingQuiz      = false;
        this.loadBatchesAndMcqs(quiz.course_id);
        this.startDate = this.formatDate(quiz.start_date);

        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingQuiz = false;
        alert('Failed to load quiz.');
        this.router.navigate(['/instructor/quiz/list']);
      }
    });
  }

  loadBatchesAndMcqs(courseId: number): void {
    this.loadingBatches = true;
    this.quizService.getInstructorBatchesByCourse(courseId).subscribe({
      next: (res: any) => {
        this.batches = res;
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingBatches = false; }
    });

    this.loadingMcqs = true;
    this.quizService.getInstructorMcqsByCourse(courseId).subscribe({
      next: (res: any) => {
        this.mcqs = res.data || [];
        this.filteredMcqs = [...this.mcqs];
        this.recalculateMarks();
        this.loadingMcqs = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingMcqs = false; }
    });
  }

  recalculateMarks(): void {
    this.totalCalculatedMarks = this.mcqs
      .filter(m => this.selectedMcqIds.includes(m.id))
      .reduce((sum, m) => Math.round((sum + (parseFloat(m.marks) || 1)) * 100) / 100, 0);
    if (this.autoCalculateMarks) this.marks = this.totalCalculatedMarks;
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
    this.loadBatchesAndMcqs(this.selectedCourseId);
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm   = String(date.getMonth() + 1).padStart(2, '0');
    const dd   = String(date.getDate()).padStart(2, '0');
    const hh   = String(date.getHours()).padStart(2, '0');
    const min  = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  onSubmit(): void {
    if (!this.name?.trim()) { alert('Please enter quiz name.'); return; }
    if (!this.selectedCourseId) { alert('Please select a course.'); return; }
    if (!this.selectedBatchId) { alert('Please select a batch.'); return; }
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

    this.quizService.updateInstructorQuiz(this.quizId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Quiz updated successfully!');
          this.router.navigate(['/instructor/quiz/list']);
        } else {
          alert(res.message || 'Failed to update quiz.');
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to update quiz.');
        console.error(err);
      }
    });
  }
}
