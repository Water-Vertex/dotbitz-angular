import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';

@Component({
  selector: 'app-quiz-check',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-check.html',
})
export class AdminQuizCheck implements OnInit {

  attemptId!: number;
  attempt: any = null;
  loading = false;
  submitting = false;

  // Answer statuses — answer_id → 'correct' | 'wrong'
  answerStatuses: { [answerId: number]: string } = {};

  // Form fields
  obtainedMarks: number = 0;
  remarks: string = '';
  autoCalculateMarks: boolean = true;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    this.loadAttempt();
  }

  loadAttempt(): void {
    this.loading = true;
    this.quizService.getAttemptDetail(this.attemptId).subscribe({
      next: (res: any) => {
        this.attempt = res.data;

        // Handle remarks
        const systemRemarks = ['Time up — auto submitted', 'Submitted by student'];
        const existing = res.data.remarks || '';
        this.remarks = systemRemarks.includes(existing) ? '' : existing;

        // Auto check answers and calculate marks
        let autoObtainedMarks = 0;

        res.data.answers?.forEach((ans: any) => {
          // Get student answer and correct answer
          const studentAnswer = (ans.student_answer || '').trim().toLowerCase();
          const correctAnswer = (ans.mcq?.answer || '').trim().toLowerCase();

          // Check if answer is correct (for single/multiple choice)
          let isCorrect = false;

          if (ans.mcq?.issingle) {
            // For single choice - exact match
            isCorrect = studentAnswer === correctAnswer && studentAnswer !== '';
          } else {
            // For multiple choice - need to compare arrays
            try {
              const studentAnswers = studentAnswer ? JSON.parse(studentAnswer) : [];
              const correctAnswers = correctAnswer ? JSON.parse(correctAnswer) : [];
              isCorrect = studentAnswers.length === correctAnswers.length &&
                         studentAnswers.every((a: any) => correctAnswers.includes(a));
            } catch {
              // If not JSON, compare as string
              isCorrect = studentAnswer === correctAnswer;
            }
          }

          // Set status based on correctness
          this.answerStatuses[ans.id] = isCorrect ? 'correct' : 'wrong';

          // Calculate marks
          if (isCorrect) {
            const marksValue = parseFloat(ans.mcq?.marks) || 1;
            autoObtainedMarks = this.addMarks(autoObtainedMarks, marksValue);
          }
        });

        // Auto set obtained marks
        this.obtainedMarks = autoObtainedMarks;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        alert('Failed to load attempt.');
        this.router.navigate(['/admin/quiz/attempts']);
      }
    });
  }

  // Helper function for decimal addition
  private addMarks(current: number, marks: number): number {
    const result = current + marks;
    return parseFloat(result.toFixed(2));
  }

  private subtractMarks(current: number, marks: number): number {
    const result = current - marks;
    return parseFloat(Math.max(0, result).toFixed(2));
  }

  // ✅ FIXED: Check autoCalculateMarks at the beginning
  setAnswerStatus(answerId: number, status: string): void {
    // ❌ Prevent execution if auto-calculation is disabled
    if (!this.autoCalculateMarks) {
      console.log('Auto-calculation is disabled, cannot change answer status');
      return;
    }

    const prevStatus = this.answerStatuses[answerId];

    // Don't change if same status
    if (prevStatus === status) return;

    // Find answer and its marks
    const answer = this.attempt?.answers?.find((a: any) => a.id === answerId);
    const mcqMarks = parseFloat(answer?.mcq?.marks || 1);

    // Update status
    this.answerStatuses[answerId] = status;

    // Update marks based on change
    if (prevStatus === 'correct' && status === 'wrong') {
      this.obtainedMarks = this.subtractMarks(this.obtainedMarks, mcqMarks);
    } else if (prevStatus === 'wrong' && status === 'correct') {
      this.obtainedMarks = this.addMarks(this.obtainedMarks, mcqMarks);
    }
  }

  // Get answer status for display
  getAnswerStatus(answerId: number): string {
    return this.answerStatuses[answerId] || 'wrong';
  }

  // Toggle auto-calculation
  toggleAutoCalculate(): void {
    this.autoCalculateMarks = !this.autoCalculateMarks;

    // Optional: Show a message when toggling
    if (!this.autoCalculateMarks) {
      console.log('Manual mode enabled - answer buttons are now disabled');
    } else {
      console.log('Auto mode enabled - marks will auto-calculate from answers');
    }
  }

  // Manual update of marks (when auto-calculation is off)
  onMarksChange(): void {
    if (this.obtainedMarks < 0) this.obtainedMarks = 0;
    if (this.obtainedMarks > this.attempt?.quiz?.marks) {
      this.obtainedMarks = this.attempt?.quiz?.marks;
    }
  }

  onSubmit(): void {
    if (this.obtainedMarks === undefined || this.obtainedMarks === null) {
      alert('Please enter obtained marks.');
      return;
    }

    this.submitting = true;

    const answersPayload = Object.entries(this.answerStatuses).map(([answerId, status]) => ({
      answer_id: Number(answerId),
      status: status,
    }));

    const payload = {
      answers: answersPayload,
      obtained_marks: this.obtainedMarks,
      remarks: this.remarks,
    };

    this.quizService.checkQuiz(this.attemptId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          alert('Quiz checked successfully!');
          this.router.navigate(['/admin/quiz/attempts']);
        } else {
          alert(res.message || 'Failed to check quiz.');
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to check quiz.');
        console.error(err);
      }
    });
  }
}
