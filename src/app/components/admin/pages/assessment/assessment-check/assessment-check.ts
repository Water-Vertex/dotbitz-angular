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

        // Reset marks arrays
        this.answers = {};
        this.qnaMarks = {};

        if (this.attemptData && this.attemptData.answers) {
          this.attemptData.answers.forEach((a: any) => {
            if (a.assessment_type === 'mcqs') {
              // Auto-mark MCQ
              const isCorrect = this.autoMarkMcq(a.student_answer, a.correct_answer);
              console.log(`Question ${a.question_id}: Student="${a.student_answer}", Correct="${a.correct_answer}", IsCorrect=${isCorrect}`);
              this.answers[a.question_id] = isCorrect;
            }
            else if (a.assessment_type === 'q-a') {
              // Q&A: Pehle obtained_marks dekho, agar nahi to is_correct dekho
              let existingMarks = 0;

              if (a.obtained_marks !== null && a.obtained_marks !== undefined) {
                existingMarks = a.obtained_marks;
              } else if (a.is_correct !== null && a.is_correct !== undefined && a.is_correct > 0) {
                existingMarks = a.is_correct;
              }

              this.qnaMarks[a.question_id] = parseFloat(existingMarks.toString());
              console.log(`Q&A Question ${a.question_id}: Existing Marks = ${existingMarks}`);
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
  let val = parseFloat(marks.toString());
  if (isNaN(val)) val = 0;
  if (val > maxMarks) val = maxMarks;
  if (val < 0) val = 0;
  this.qnaMarks[questionId] = val;
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
  // get calculatedObtainMarks(): number {
  //   let total = 0;
  //   if (!this.attemptData || !this.attemptData.answers) return 0;

  //   for (const ans of this.attemptData.answers) {
  //     if (ans.assessment_type === 'mcqs') {
  //       // MCQ: full marks if correct
  //       if (this.answers[ans.question_id] === true) {
  //         total += Number(ans.marks) || 0;
  //       }
  //     } else if (ans.assessment_type === 'q-a') {
  //       // Q&A: use manually entered marks
  //       const marks = this.qnaMarks[ans.question_id];
  //       if (marks !== undefined && marks !== null) {
  //         total += Number(marks);
  //       }
  //     }
  //   }

  //   console.log('Total calculated marks:', total);
  //   return total;
  // }
get calculatedObtainMarks(): number {
  let total = 0;
  if (!this.attemptData || !this.attemptData.answers) return 0;

  for (const ans of this.attemptData.answers) {
    if (ans.assessment_type === 'mcqs') {
      if (this.answers[ans.question_id] === true) {
        total += Number(ans.marks) || 0;
      }
    } else if (ans.assessment_type === 'q-a') {
      const marks = parseFloat(this.qnaMarks[ans.question_id]?.toString() || '0');
      if (!isNaN(marks)) total += marks;
    }
  }
  return parseFloat(total.toFixed(2)); // floating point errors avoid karo
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
      return {
        question_id: a.question_id,
        is_correct: this.answers[a.question_id] === true ? 1 : 0,
      };
    } else {
      // Q&A — send exact decimal marks
      return {
        question_id: a.question_id,
        is_correct: parseFloat(this.qnaMarks[a.question_id]?.toString() || '0'),
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
