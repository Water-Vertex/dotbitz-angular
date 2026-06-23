import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { CourseService } from '../../../../../services/course.service';

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-edit.html',
  styleUrls: ['./quiz-edit.css']
})
export class QuizEdit implements OnInit {

  quizId!: number;

  // Dropdowns
  courses: any[] = [];
  batches: any[] = [];
  mcqs: any[] = [];

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
  loadingQuiz = false;
  submitting = false;

  // Search and filtering
  filteredMcqs: any[] = [];
  mcqSearch: string = '';

  // Auto-calculation
  totalCalculatedMarks: number = 0;
  autoCalculateMarks: boolean = true;

  constructor(
    private quizService: QuizService,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data?.data || res.data || [];
        this.loadingCourses = false;
        // Load quiz after courses
        this.loadQuiz();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCourses = false;
        this.cdr.detectChanges();
      }
    });
  }
formatDate(date: any): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

  loadQuiz(): void {
    this.loadingQuiz = true;
    this.quizService.getQuiz(this.quizId).subscribe({
      next: (res: any) => {
        const quiz = res.data;

        // Fill form fields
        this.name = quiz.name;
        this.marks = quiz.marks;
        this.duration = quiz.duration;
        this.status = quiz.status;
        this.dueDate = this.formatDateForInput(quiz.due_date);
        this.selectedCourseId = quiz.course_id;
        this.selectedBatchId = quiz.batch_id;
        this.startDate = this.formatDate(quiz.start_date);


        // Selected MCQ IDs - FIXED: Use 'id' instead of 'msq_id'
        this.selectedMcqIds = quiz.mcqs.map((m: any) => m.id || m.msq_id);

        this.loadingQuiz = false;

        // Load batches and MCQs
        this.loadBatchesAndMcqs(quiz.course_id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingQuiz = false;
        alert('Failed to load quiz.');
        this.router.navigate(['/admin/quiz/list']);
      }
    });
  }

  loadBatchesAndMcqs(courseId: number): void {
    // Load batches
    this.loadingBatches = true;
    this.quizService.getBatchesByCourse(courseId).subscribe({
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
    this.quizService.getMcqsByCourse(courseId).subscribe({
      next: (res: any) => {
        this.mcqs = res.data || [];

        // Ensure marks are numbers
        this.mcqs.forEach(mcq => {
          if (mcq.marks && typeof mcq.marks === 'string') {
            mcq.marks = parseFloat(mcq.marks);
          }
          if (!mcq.marks || isNaN(mcq.marks)) {
            mcq.marks = 1;
          }
        });

        this.filteredMcqs = [...this.mcqs];
        this.loadingMcqs = false;

        // Recalculate marks after loading
        this.recalculateMarks();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingMcqs = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Recalculate total marks based on selected MCQs
  recalculateMarks(): void {
    // FIXED: Use 'id' instead of 'msq_id'
    this.totalCalculatedMarks = this.mcqs
      .filter(m => this.selectedMcqIds.includes(m.id))
      .reduce((sum, m) => {
        const marksValue = parseFloat(m.marks) || 1;
        return sum + marksValue;
      }, 0);

    // Round to 2 decimal places
    this.totalCalculatedMarks = parseFloat(this.totalCalculatedMarks.toFixed(2));

    if (this.autoCalculateMarks) {
      this.marks = this.totalCalculatedMarks;
    }
  }

  // Search filter
  onMcqSearch(): void {
    const query = this.mcqSearch.toLowerCase().trim();
    if (!query) {
      this.filteredMcqs = [...this.mcqs];
    } else {
      this.filteredMcqs = this.mcqs.filter(m =>
        m.question.toLowerCase().includes(query)
      );
    }
  }

  // Course change handler
  onCourseChange(): void {
    // Reset selections
    this.selectedBatchId = null;
    this.batches = [];
    this.mcqs = [];
    this.filteredMcqs = [];
    this.selectedMcqIds = [];
    this.mcqSearch = '';
    this.totalCalculatedMarks = 0;

    if (this.autoCalculateMarks) {
      this.marks = null;
    }

    if (!this.selectedCourseId) return;

    this.loadBatchesAndMcqs(this.selectedCourseId);
  }

  // Toggle MCQ selection with proper decimal handling
  onMcqToggle(mcqId: number, event: any): void {
    const mcq = this.mcqs.find(m => m.id === mcqId);

    if (!mcq) return;

    // Get marks as number with proper decimal handling
    let marksValue = 1; // default
    if (mcq.marks) {
      marksValue = typeof mcq.marks === 'string' ? parseFloat(mcq.marks) : mcq.marks;
      if (isNaN(marksValue)) marksValue = 1;
    }

    if (event.target.checked) {
      // Add MCQ
      if (!this.selectedMcqIds.includes(mcqId)) {
        this.selectedMcqIds.push(mcqId);
        this.totalCalculatedMarks = this.totalCalculatedMarks + marksValue;
      }
    } else {
      // Remove MCQ
      this.selectedMcqIds = this.selectedMcqIds.filter(id => id !== mcqId);
      this.totalCalculatedMarks = this.totalCalculatedMarks - marksValue;
    }

    // Round to 2 decimal places to avoid floating point issues
    this.totalCalculatedMarks = parseFloat(this.totalCalculatedMarks.toFixed(2));

    // Update marks field if auto-calculation is enabled
    if (this.autoCalculateMarks) {
      this.marks = this.totalCalculatedMarks;
    }
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

  // Select all MCQs (from filtered list)
  selectAllMcqs(): void {
    this.filteredMcqs.forEach(mcq => {
      if (!this.selectedMcqIds.includes(mcq.id)) {
        this.selectedMcqIds.push(mcq.id);
        const marksValue = parseFloat(mcq.marks) || 1;
        this.totalCalculatedMarks = this.totalCalculatedMarks + marksValue;
      }
    });

    // Round to 2 decimal places
    this.totalCalculatedMarks = parseFloat(this.totalCalculatedMarks.toFixed(2));

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

  // Format date for datetime-local input
  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
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

    this.quizService.updateQuiz(this.quizId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Quiz updated successfully!');
          this.router.navigate(['/admin/quiz/list']);
        } else {
          alert(res.message || 'Failed to update quiz.');
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to update quiz. Please try again.');
        console.error('Quiz update error:', err);
      }
    });
  }

  // Cancel and go back
  onCancel(): void {
    this.router.navigate(['/admin/quiz/list']);
  }
}
