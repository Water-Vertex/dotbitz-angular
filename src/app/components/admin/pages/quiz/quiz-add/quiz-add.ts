import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-quiz-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-add.html'
})
export class QuizAdd implements OnInit {

  // Dropdowns
  courses: any[] = [];
  batches: any[] = [];
  mcqs: any[] = [];
  filteredMcqs: any[] = [];

  // Search
  mcqSearch: string = '';

  // Selected values
  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;
  selectedMcqIds: number[] = [];

  // Form fields
  name: string = '';
  marks: number | null = null;
  duration: number | null = null;
  status: string = 'draft';
  dueDate: string = '';
  startDate: string = '';

  // Loading states
  loadingCourses = false;
  loadingBatches = false;
  loadingMcqs = false;
  submitting = false;

  // Auto-calculation
  totalCalculatedMarks: number = 0;
  autoCalculateMarks: boolean = true;

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCourses = false;
        this.cdr.detectChanges();
      }
    });
  }

  onCourseChange(): void {
    // Reset all selections
    this.selectedBatchId = null;
    this.batches = [];
    this.mcqs = [];
    this.filteredMcqs = [];
    this.selectedMcqIds = [];
    this.mcqSearch = '';
    this.totalCalculatedMarks = 0;

    // Reset marks based on auto-calculation setting
    if (this.autoCalculateMarks) {
      this.marks = null;
    }

    if (!this.selectedCourseId) return;

    // Load batches
    this.loadingBatches = true;
    this.quizService.getBatchesByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.batches = res;
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingBatches = false;
        this.cdr.detectChanges();
      }
    });

    // Load MCQs
    this.loadingMcqs = true;
    this.quizService.getMcqsByCourse(this.selectedCourseId).subscribe({
      next: (res: any) => {
        this.mcqs = res.data || [];
        this.filteredMcqs = [...this.mcqs];
        this.loadingMcqs = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingMcqs = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Search filter for MCQs
  onMcqSearch(): void {
    const query = this.mcqSearch.toLowerCase().trim();
    if (!query) {
      this.filteredMcqs = [...this.mcqs];
    } else {
      this.filteredMcqs = this.mcqs.filter(mcq =>
        mcq.question.toLowerCase().includes(query)
      );
    }
  }

  // Toggle MCQ selection with auto-calculation
  onMcqToggle(mcqId: number, event: any): void {
  const mcq = this.mcqs.find(m => m.id === mcqId);

  if (!mcq) return;

  // Get marks as number with proper decimal handling
  const marksValue = parseFloat(mcq.marks) || 1;

  if (event.target.checked) {
    // Add MCQ - use numeric addition
    this.selectedMcqIds.push(mcqId);
    this.totalCalculatedMarks = this.totalCalculatedMarks + marksValue;
  } else {
    // Remove MCQ - use numeric subtraction
    this.selectedMcqIds = this.selectedMcqIds.filter(id => id !== mcqId);
    this.totalCalculatedMarks = this.totalCalculatedMarks - marksValue;
  }

  // Round to 2 decimal places to avoid floating point issues
  this.totalCalculatedMarks = Math.round(this.totalCalculatedMarks * 100) / 100;

  // Update marks field if auto-calculation is enabled
  if (this.autoCalculateMarks) {
    this.marks = this.totalCalculatedMarks;
  }

  // Debug log to check
  console.log(`Added/Removed: ${marksValue}, Total: ${this.totalCalculatedMarks}`);
}

  // Check if MCQ is selected
  isMcqSelected(mcqId: number): boolean {
    return this.selectedMcqIds.includes(mcqId);
  }

  // Toggle auto-calculation mode
  toggleAutoCalculate(): void {
    this.autoCalculateMarks = !this.autoCalculateMarks;
    if (this.autoCalculateMarks) {
      // When enabling auto-calculation, update marks with calculated total
      this.marks = this.totalCalculatedMarks;
    }
  }

  // Select all MCQs
  selectAllMcqs(): void {
  this.filteredMcqs.forEach(mcq => {
    if (!this.selectedMcqIds.includes(mcq.id)) {
      this.selectedMcqIds.push(mcq.id);
      const marksValue = parseFloat(mcq.marks) || 1;
      this.totalCalculatedMarks = this.totalCalculatedMarks + marksValue;
    }
  });

  // Round to 2 decimal places
  this.totalCalculatedMarks = Math.round(this.totalCalculatedMarks * 100) / 100;

  if (this.autoCalculateMarks) {
    this.marks = this.totalCalculatedMarks;
  }
}

  // Deselect all MCQs
 deselectAllMcqs(): void {
  this.selectedMcqIds = [];
  this.totalCalculatedMarks = 0;

  if (this.autoCalculateMarks) {
    this.marks = null;
  }
}

  // Form submission
  onSubmit(): void {
    // Validation
    if (!this.name || !this.name.trim()) {
      alert('Please enter quiz name.');
      return;
    }

    if (!this.selectedCourseId) {
      alert('Please select a course.');
      return;
    }

    if (!this.selectedBatchId) {
      alert('Please select a batch.');
      return;
    }

    if (!this.dueDate) {
      alert('Please select due date.');
      return;
    }

    if (this.selectedMcqIds.length === 0) {
      alert('Please select at least one MCQ.');
      return;
    }

    if (!this.marks || this.marks <= 0) {
      alert('Please enter valid total marks.');
      return;
    }

    this.submitting = true;

    const payload = {
      name: this.name.trim(),
      marks: this.marks,
      duration: this.duration,
      status: this.status,
      course_id: this.selectedCourseId,
      batch_id: this.selectedBatchId,
      due_date: this.dueDate,
      start_date: this.startDate || null,
      mcq_ids: this.selectedMcqIds,
    };

    this.quizService.createQuiz(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Quiz created successfully!');
          this.router.navigate(['/admin/quiz/list']);
        } else {
          alert(res.message || 'Failed to create quiz. Please try again.');
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to create quiz. Please try again.');
        console.error('Quiz creation error:', err);
      }
    });
  }

  // Cancel and go back
  onCancel(): void {
    this.router.navigate(['/admin/quiz/list']);
  }
}
