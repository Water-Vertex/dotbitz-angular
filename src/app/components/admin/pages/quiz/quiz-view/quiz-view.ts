import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '../../../../../services/quiz.service';

@Component({
  selector: 'app-quiz-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz-view.html',
})
export class AdminQuizView implements OnInit {

  attemptId!: number;
  attempt: any = null;
  loading = false;
  isRecheck = false;

  // Recheck fields
  answerStatuses: { [answerId: number]: string } = {};
  obtainedMarks: number = 0;
  remarks: string = '';
  submitting = false;

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
        this.obtainedMarks = res.data.obtained_marks || 0;

        const systemRemarks = ['Time up — auto submitted', 'Submitted by student'];
        const existing = res.data.remarks || '';
        this.remarks = systemRemarks.includes(existing) ? '' : existing;

        res.data.answers?.forEach((ans: any) => {
          this.answerStatuses[ans.id] = ans.status || 'pending';
        });

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

  enableRecheck(): void {
    this.isRecheck = true;
  }
setAnswerStatus(answerId: number, status: string): void {
  if (!this.isRecheck) return;

  const prevStatus = this.answerStatuses[answerId];
  this.answerStatuses = { ...this.answerStatuses, [answerId]: status };

  const answer = this.attempt?.answers?.find((a: any) => a.id === answerId);
  const mcqMarks = answer?.mcq?.marks || 1;

  if (prevStatus === 'correct' && status === 'wrong') {
    this.obtainedMarks -= mcqMarks;
  } else if (prevStatus === 'wrong' && status === 'correct') {
    this.obtainedMarks += mcqMarks;
  } else if (prevStatus === 'pending' && status === 'correct') {
    this.obtainedMarks += mcqMarks;
  }

  if (this.obtainedMarks < 0) this.obtainedMarks = 0;
}
  // setAnswerStatus(answerId: number, status: string): void {
  //   if (!this.isRecheck) return;
  //   this.answerStatuses = { ...this.answerStatuses, [answerId]: status };
  // }

  getAnswerStatus(answerId: number): string {
    return this.answerStatuses[answerId] || 'pending';
  }

  onSubmitRecheck(): void {
    this.submitting = true;

    const answersPayload = Object.entries(this.answerStatuses).map(([answerId, status]) => ({
      answer_id: Number(answerId),
      status:    status,
    }));

    const payload = {
      answers:        answersPayload,
      obtained_marks: this.obtainedMarks,
      remarks:        this.remarks,
    };

    this.quizService.checkQuiz(this.attemptId, payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          this.isRecheck = false;
          this.loadAttempt();
          alert('Quiz rechecked successfully!');
        }
      },
      error: (err) => {
        this.submitting = false;
        alert('Failed to recheck quiz.');
        console.error(err);
      }
    });
  }
}
