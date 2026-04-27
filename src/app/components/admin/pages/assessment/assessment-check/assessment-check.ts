import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-check-assessment',
  standalone: true,
  templateUrl: './assessment-check.html',
  styleUrls: ['./assessment-check.css'],
  imports: [CommonModule, FormsModule],
})
export class AssessmentCheck implements OnInit {
  attemptId!: number;
  attemptData: any = null;
  loading: boolean = true;
  submitting: boolean = false;
  adminRemarks: string = '';
  answers: { [key: number]: boolean } = {};
  autoMarked: { [key: number]: boolean } = {};
  qnaMarks: { [key: number]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.attemptId = +params['id'];
      if (this.attemptId) {
        this.fetchAttempt();
      }
    });
  }

  fetchAttempt(): void {
    this.loading = true;
    this.attemptService.getAttemptById(this.attemptId).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        let responseData = res;
        if (res && res.data) {
          responseData = res.data;
        }

        this.attemptData = responseData;
        this.adminRemarks = this.attemptData.remarks || '';

        if (this.attemptData && this.attemptData.answers) {
          this.attemptData.answers.forEach((a: any) => {
            const isMcq = a.assessment_type === 'mcqs';

            if (isMcq) {
              // Auto-mark MCQ - FIXED: Compare correctly
              const isCorrect = this.autoMarkMcq(a.student_answer, a.correct_answer);
              console.log(`Question ${a.question_id}: Student="${a.student_answer}", Correct="${a.correct_answer}", IsCorrect=${isCorrect}`);
              this.answers[a.question_id] = isCorrect;
              this.autoMarked[a.question_id] = true;
            }
            else if (a.assessment_type === 'q-a') {
              // For Q&A, initialize with existing marks if available
              if (a.is_correct !== null && a.is_correct !== undefined && a.is_correct > 0) {
                this.qnaMarks[a.question_id] = a.is_correct;
              } else {
                this.qnaMarks[a.question_id] = 0;
              }
              this.autoMarked[a.question_id] = false;
            }
          });
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  autoMarkMcq(studentAnswer: string, correctAnswer: string): boolean {
    if (!studentAnswer || !correctAnswer) return false;

    // Handle different possible formats
    const student = studentAnswer.toString().trim().toLowerCase();
    const correct = correctAnswer.toString().trim().toLowerCase();

    // Check if it's a letter answer (A, B, C, D) or text answer
    const studentMatch = student.match(/^[a-d]$/);
    const correctMatch = correct.match(/^[a-d]$/);

    if (studentMatch && correctMatch) {
      return student === correct;
    }

    // Check if answer contains the letter option (e.g., "A. Option text")
    const studentLetter = student.charAt(0);
    const correctLetter = correct.charAt(0);

    if (studentLetter.match(/^[a-d]$/) && correctLetter.match(/^[a-d]$/)) {
      return studentLetter === correctLetter;
    }

    // Direct comparison
    return student === correct;
  }

  updateQnaMarks(questionId: number, marks: number, maxMarks: number): void {
    if (marks > maxMarks) {
      marks = maxMarks;
    }
    if (marks < 0) {
      marks = 0;
    }
    this.qnaMarks[questionId] = marks;
    this.cdr.detectChanges();
  }

  getQuestionTypeText(question: any): string {
    return question.assessment_type === 'mcqs' ? 'MCQ (Auto-graded)' : 'Q&A (Manual marking)';
  }

  getQuestionTypeClass(question: any): string {
    return question.assessment_type === 'mcqs' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';
  }

  formatOptions(options: any): string[] {
    if (!options) return [];
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch(e) {
        return options.split(',').map((opt: string) => opt.trim());
      }
    }
    return [];
  }

  /**
   * Calculate total obtained marks dynamically
   */
  get calculatedObtainMarks(): number {
    let total = 0;
    if (!this.attemptData || !this.attemptData.answers) return 0;

    for (const ans of this.attemptData.answers) {
      if (ans.assessment_type === 'mcqs') {
        // MCQ: full marks if correct
        if (this.answers[ans.question_id] === true) {
          total += Number(ans.marks) || 0;
        }
      } else if (ans.assessment_type === 'q-a') {
        // Q&A: use manually entered marks
        const marks = this.qnaMarks[ans.question_id];
        if (marks !== undefined && marks !== null) {
          total += Number(marks);
        }
      }
    }

    console.log('Total calculated marks:', total);
    return total;
  }

  /**
   * Get total possible marks
   */
  get totalPossibleMarks(): number {
    if (!this.attemptData || !this.attemptData.answers) return 0;

    let total = 0;
    for (const ans of this.attemptData.answers) {
      total += Number(ans.marks) || 0;
    }
    return total;
  }

  submitGrading(): void {
    if (this.submitting) return;

    if (!confirm('Are you sure you want to submit these grades?')) {
      return;
    }

    this.submitting = true;

    const payload = {
      obtain_marks: this.calculatedObtainMarks,
      remarks: this.adminRemarks,
      answers: this.attemptData.answers.map((a: any) => {
        if (a.assessment_type === 'mcqs') {
          // FIX: Send boolean instead of number
          return {
            question_id: a.question_id,
            is_correct: this.answers[a.question_id] === true, // true/false, not 1/0
          };
        } else {
          // For Q&A: is_correct stores the actual marks obtained
          return {
            question_id: a.question_id,
            is_correct: this.qnaMarks[a.question_id] || 0,
          };
        }
      }),
    };

    console.log('Submitting payload:', payload);

    this.attemptService.gradeAttempt(this.attemptId, payload).subscribe({
      next: (res) => {
        console.log('Grading saved successfully!', res);
        this.router.navigate(['/admin/assessment-attempts/list']);
      },
      error: (err) => {
        console.error('Submission error:', err);
        alert('Failed to save grading: ' + (err.error?.message || 'Server error'));
        this.submitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  parseFloatValue(value: any): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  goBack(): void {
    this.router.navigate(['/admin/assessment-attempts/list']);
  }
}
