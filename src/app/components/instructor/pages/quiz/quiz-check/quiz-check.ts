import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-instructor-quiz-check',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-check.html',
})
export class InstructorQuizCheck implements OnInit {

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
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
    this.loadAttempt();
  }

  loadAttempt(): void {
    this.loading = true;
    this.quizService.getInstructorAttemptDetail(this.attemptId).subscribe({
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

          // Check if answer is correct
          let isCorrect = false;

          if (ans.mcq?.issingle) {
            // For single choice - exact match
            isCorrect = studentAnswer === correctAnswer && studentAnswer !== '';
          } else {
            // For multiple choice - compare arrays
            try {
              const studentAnswers = studentAnswer ? JSON.parse(studentAnswer) : [];
              const correctAnswers = correctAnswer ? JSON.parse(correctAnswer) : [];
              isCorrect = studentAnswers.length === correctAnswers.length &&
                         studentAnswers.every((a: any) => correctAnswers.includes(a));
            } catch {
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
        this.toastService.error('Error', 'Failed to load attempt.');
        this.router.navigate(['/instructor/quiz/attempts']);
      }
    });
  }

  private addMarks(current: number, marks: number): number {
    const result = current + marks;
    return parseFloat(result.toFixed(2));
  }

  private subtractMarks(current: number, marks: number): number {
    const result = current - marks;
    return parseFloat(Math.max(0, result).toFixed(2));
  }

  setAnswerStatus(answerId: number, status: string): void {
    if (!this.autoCalculateMarks) {
      return;
    }

    const prevStatus = this.answerStatuses[answerId];
    if (prevStatus === status) return;

    const answer = this.attempt?.answers?.find((a: any) => a.id === answerId);
    const mcqMarks = parseFloat(answer?.mcq?.marks || 1);

    this.answerStatuses[answerId] = status;

    if (prevStatus === 'correct' && status === 'wrong') {
      this.obtainedMarks = this.subtractMarks(this.obtainedMarks, mcqMarks);
    } else if (prevStatus === 'wrong' && status === 'correct') {
      this.obtainedMarks = this.addMarks(this.obtainedMarks, mcqMarks);
    }
  }

  getAnswerStatus(answerId: number): string {
    return this.answerStatuses[answerId] || 'wrong';
  }

  toggleAutoCalculate(): void {
    this.autoCalculateMarks = !this.autoCalculateMarks;
  }

  onMarksChange(): void {
    if (this.obtainedMarks < 0) this.obtainedMarks = 0;
    if (this.obtainedMarks > this.attempt?.quiz?.marks) {
      this.obtainedMarks = this.attempt?.quiz?.marks;
    }
  }

  onSubmit(): void {
    if (this.obtainedMarks === undefined || this.obtainedMarks === null) {
      this.toastService.error('Error', 'Please enter obtained marks.');
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

    this.quizService.checkInstructorQuiz(this.attemptId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          this.toastService.success('Success', 'Quiz checked successfully!');
          this.router.navigate(['/instructor/quiz/attempts']);
        } else {
          this.toastService.error('Error', res.message || 'Failed to check quiz.');
        }
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.error('Error', 'Failed to check quiz.');
        console.error(err);
      }
    });
  }
}
