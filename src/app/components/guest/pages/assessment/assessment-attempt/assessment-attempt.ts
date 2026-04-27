// import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

// @Component({
//   selector: 'app-attempt-assessment',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './assessment-attempt.html',
//   styleUrl: './assessment-attempt.css',
// })
// export class GuestAssessmentAttempt implements OnInit, OnDestroy {
//   assignAssessmentId!: number;
//   assessment: any = null;
//   attempt: any = null;
//   assignAssessment: any = null;
//   questions: any[] = [];
//   loading = true;
//   submitting = false;
//   isGuest = false; // Feature: URL detection for Guest

//   answers: { [questionId: number]: string } = {};

//   totalSeconds = 0;
//   remainingSeconds = 0;
//   timerInterval: any = null;

//   showTimeUpModal = false;
//   showSuccessModal = false;
//   successData: any = null;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private assessmentAttemptService: AssessmentAttemptService,
//     private cdr: ChangeDetectorRef,
//   ) {}

//   ngOnInit(): void {
//     this.assignAssessmentId = Number(this.route.snapshot.paramMap.get('assignAssessmentId'));

//     // Feature: Check if current route is for guest
//     this.isGuest = this.router.url.includes('/guest/');

//     // Security: Guest ke liye email hona lazmi hai
//     if (this.isGuest && !localStorage.getItem('guest_email')) {
//       alert('Invalid access. Please use the link provided.');
//       this.router.navigate(['/']);
//       return;
//     }

//     this.startAssessment();
//   }

//   ngOnDestroy(): void {
//     this.clearTimer();
//   }

//   // Feature: Timer UI colors (Property fix)
//   get timerColor(): string {
//     if (this.timerPercent > 50) return 'text-green-600';
//     if (this.timerPercent > 25) return 'text-yellow-500';
//     return 'text-red-600';
//   }

//   isMcq(q: any): boolean {
//     const type = q?.assessment_type?.toLowerCase()?.trim();
//     return type === 'mcq' || type === 'mcqs' || type === 'multiple_choice';
//   }

//   startAssessment(): void {
//     this.loading = true;

//     // Feature: Conditional call based on user type
//     const call$ = this.isGuest
//       ? this.assessmentAttemptService.guestStartAssessment(this.assignAssessmentId)
//       : this.assessmentAttemptService.startAssessment(this.assignAssessmentId);

//     call$.subscribe({
//       next: (res: any) => {
//         if (res.success) {
//           this.assessment = res.data.assessment;
//           this.attempt = res.data.attempt;
//           this.assignAssessment = res.data.assign_assessment;

//           this.questions = (this.assessment?.questions || []).map((q: any) => {
//             let parsedOptions = [];
//             try {
//               if (typeof q.options === 'string') {
//                 parsedOptions = JSON.parse(q.options);
//               } else {
//                 parsedOptions = q.options || [];
//               }
//             } catch (e) {
//               parsedOptions = q.options && typeof q.options === 'string' ? q.options.split(',') : [];
//             }
//             return { ...q, options: parsedOptions };
//           });

//           this.loading = false;
//           this.initTimer();
//           this.cdr.detectChanges();
//         }
//       },
//       error: (err) => {
//         this.loading = false;
//         if (err.status === 409) {
//           alert('You have already attempted this assessment.');
//         } else {
//           alert('Failed to start assessment.');
//         }
//         this.goBack();
//       },
//     });
//   }

//   initTimer(): void {
//     const minutes = this.assignAssessment?.time_to_complete || 30;
//     this.totalSeconds = minutes * 60;
//     this.remainingSeconds = this.totalSeconds;

//     this.timerInterval = setInterval(() => {
//       this.remainingSeconds--;
//       this.cdr.detectChanges();
//       if (this.remainingSeconds <= 0) {
//         this.clearTimer();
//         this.onTimeUp();
//       }
//     }, 1000);
//   }

//   clearTimer(): void {
//     if (this.timerInterval) {
//       clearInterval(this.timerInterval);
//       this.timerInterval = null;
//     }
//   }

//   get timerDisplay(): string {
//     const m = Math.floor(this.remainingSeconds / 60);
//     const s = this.remainingSeconds % 60;
//     return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
//   }

//   get timerPercent(): number {
//     return this.totalSeconds === 0 ? 0 : (this.remainingSeconds / this.totalSeconds) * 100;
//   }

//   objectKeys(obj: any): string[] {
//     return Object.keys(obj);
//   }

//   onAnswerSelect(questionId: number, option: string): void {
//     this.answers[questionId] = option;
//   }

//   isSelected(questionId: number, option: string): boolean {
//     return this.answers[questionId] === option;
//   }

//   onWrittenAnswer(questionId: number, value: string): void {
//     this.answers[questionId] = value;
//   }

//   onTimeUp(): void {
//     this.showTimeUpModal = true;
//     this.cdr.detectChanges();
//     setTimeout(() => this.submitAssessment('time_up'), 3000);
//   }

//   onSubmit(): void {
//     const answered = Object.keys(this.answers).length;
//     const total = this.questions.length;
//     if (answered < total) {
//       if (!confirm(`You have ${total - answered} unanswered questions. Submit anyway?`)) return;
//     }
//     this.submitAssessment('completed');
//   }

//   submitAssessment(status: 'completed' | 'time_up'): void {
//     if (this.submitting) return;
//     this.submitting = true;
//     this.clearTimer();

//     const payload = {
//       status,
//       answers: this.questions.map((q: any) => ({
//         question_id: q.id,
//         student_answer: this.answers[q.id] || '',
//       })),
//     };

//     // Feature: Conditional submit call
//     const call$ = this.isGuest
//       ? this.assessmentAttemptService.guestSubmitAssessment(this.attempt.id, payload)
//       : this.assessmentAttemptService.submitAssessment(this.attempt.id, payload);

//     call$.subscribe({
//       next: (res: any) => {
//         this.submitting = false;
//         this.showTimeUpModal = false;
//         this.successData = { ...res, status };
//         this.showSuccessModal = true;
//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         this.submitting = false;
//         alert('Failed to submit assessment.');
//       },
//     });
//   }

//   goBack(): void {
//     // Feature: Back navigation based on user type
//     if (this.isGuest) {
//       this.router.navigate(['/guest/guest-assessments']);
//     } else {
//       this.router.navigate(['/student/my-assessments']);
//     }
//   }
// }

import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

@Component({
  selector: 'app-attempt-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-attempt.html',
  styleUrl: './assessment-attempt.css',
})
export class GuestAssessmentAttempt implements OnInit, OnDestroy {
  assignAssessmentId!: number;
  assessment: any = null;
  attempt: any = null;
  assignAssessment: any = null;
  questions: any[] = [];
  loading = true;
  submitting = false;
  isGuest = false;
  isResume = false; // ✅ NEW

  answers: { [questionId: number]: string } = {};

  totalSeconds = 0;
  remainingSeconds = 0;
  timerInterval: any = null;

  showTimeUpModal = false;
  showSuccessModal = false;
  successData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentAttemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.assignAssessmentId = Number(this.route.snapshot.paramMap.get('assignAssessmentId'));
    this.isGuest = this.router.url.includes('/guest/');

    if (this.isGuest && !localStorage.getItem('guest_email')) {
      alert('Invalid access. Please use the link provided.');
      this.router.navigate(['/']);
      return;
    }

    this.startAssessment();
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.autoSaveAnswers(); // ✅ Tab/window band pe save
  }

  // ✅ Browser close pe save
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.autoSaveAnswers();
  }

  // ✅ Tab hide pe save
  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) {
      this.autoSaveAnswers();
    }
  }

  // ✅ Auto save
  autoSaveAnswers(): void {
    if (!this.attempt || this.submitting) return;
    if (Object.keys(this.answers).length === 0) return;

    const answersPayload = this.questions.map((q: any) => ({
      question_id:    q.id,
      student_answer: this.answers[q.id] || '',
    }));

    // localStorage backup
    localStorage.setItem(`assessment_answers_${this.attempt.id}`, JSON.stringify({
      answers: this.answers,
      savedAt: Date.now(),
    }));

    // Server pe save
    const save$ = this.isGuest
      ? this.assessmentAttemptService.guestSaveProgress(this.attempt.id, answersPayload)
      : this.assessmentAttemptService.saveProgress(this.attempt.id, answersPayload);

    save$.subscribe({ next: () => {}, error: () => {} });
  }

  startAssessment(): void {
    this.loading = true;

    const call$ = this.isGuest
      ? this.assessmentAttemptService.guestStartAssessment(this.assignAssessmentId)
      : this.assessmentAttemptService.startAssessment(this.assignAssessmentId);

    call$.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.assessment      = res.data.assessment;
          this.attempt         = res.data.attempt;
          this.assignAssessment = res.data.assign_assessment;
          this.isResume        = res.is_resume || false; // ✅

          this.questions = (this.assessment?.questions || []).map((q: any) => {
            let parsedOptions = [];
            try {
              parsedOptions = typeof q.options === 'string'
                ? JSON.parse(q.options)
                : (q.options || []);
            } catch {
              parsedOptions = typeof q.options === 'string'
                ? q.options.split(',')
                : [];
            }
            return { ...q, options: parsedOptions };
          });

          // ✅ Resume: server se answers restore
          if (this.isResume && res.data.saved_answers) {
            const serverAnswers = res.data.saved_answers;
            Object.keys(serverAnswers).forEach(qId => {
              if (serverAnswers[qId]) {
                this.answers[Number(qId)] = serverAnswers[qId];
              }
            });
            this.mergeLocalStorageAnswers(); // localStorage se bhi merge
          }

          this.loading = false;
          this.initTimer();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          alert('You have already attempted this assessment.');
        } else if (err.status === 403) {
          alert(err.error?.message || 'Assessment deadline has passed.');
        } else {
          alert('Failed to start assessment.');
        }
        this.goBack();
      },
    });
  }

  // ✅ localStorage se answers merge
  mergeLocalStorageAnswers(): void {
    const saved = localStorage.getItem(`assessment_answers_${this.attempt.id}`);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.answers) {
        Object.keys(parsed.answers).forEach(qId => {
          if (parsed.answers[qId] && !this.answers[Number(qId)]) {
            this.answers[Number(qId)] = parsed.answers[qId];
          }
        });
      }
    } catch {}
  }

  // ✅ Timer — server ke created_at se calculate
  initTimer(): void {
    const minutes    = this.assignAssessment?.time_to_complete || 30;
    const totalSecs  = minutes * 60;
    this.totalSeconds = totalSecs;

    if (this.isResume && this.attempt?.created_at) {
      const startTime = new Date(this.attempt.created_at).getTime();
      const elapsed   = Math.floor((Date.now() - startTime) / 1000);
      this.remainingSeconds = Math.max(0, totalSecs - elapsed);
    } else {
      this.remainingSeconds = totalSecs;
    }

    if (this.remainingSeconds <= 0) {
      this.onTimeUp();
      return;
    }

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;
      this.cdr.detectChanges();

      // ✅ Har 30 sec pe auto-save
      if (this.remainingSeconds % 30 === 0) {
        this.autoSaveAnswers();
      }

      if (this.remainingSeconds <= 0) {
        this.clearTimer();
        this.onTimeUp();
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get timerDisplay(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get timerPercent(): number {
    return this.totalSeconds === 0 ? 0 : (this.remainingSeconds / this.totalSeconds) * 100;
  }

  get timerColor(): string {
    if (this.timerPercent > 50) return 'text-green-600';
    if (this.timerPercent > 25) return 'text-yellow-500';
    return 'text-red-600';
  }

  isMcq(q: any): boolean {
    const type = q?.assessment_type?.toLowerCase()?.trim();
    return type === 'mcq' || type === 'mcqs' || type === 'multiple_choice';
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onAnswerSelect(questionId: number, option: string): void {
    this.answers[questionId] = option;
  }

  isSelected(questionId: number, option: string): boolean {
    return this.answers[questionId] === option;
  }

  onWrittenAnswer(questionId: number, value: string): void {
    this.answers[questionId] = value;
  }

  onTimeUp(): void {
    this.showTimeUpModal = true;
    this.cdr.detectChanges();
    setTimeout(() => this.submitAssessment('time_up'), 3000);
  }

  onSubmit(): void {
    const answered = Object.keys(this.answers).length;
    const total    = this.questions.length;
    if (answered < total) {
      if (!confirm(`You have ${total - answered} unanswered questions. Submit anyway?`)) return;
    }
    this.submitAssessment('completed');
  }

  submitAssessment(status: 'completed' | 'time_up'): void {
    if (this.submitting) return;
    this.submitting = true;
    this.clearTimer();

    const payload = {
      status,
      answers: this.questions.map((q: any) => ({
        question_id:    q.id,
        student_answer: this.answers[q.id] || '',
      })),
    };

    const call$ = this.isGuest
      ? this.assessmentAttemptService.guestSubmitAssessment(this.attempt.id, payload)
      : this.assessmentAttemptService.submitAssessment(this.attempt.id, payload);

    call$.subscribe({
      next: (res: any) => {
        // ✅ localStorage clean karo
        localStorage.removeItem(`assessment_answers_${this.attempt.id}`);
        this.submitting       = false;
        this.showTimeUpModal  = false;
        this.successData      = { ...res, status };
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.submitting = false;
        alert('Failed to submit assessment.');
      },
    });
  }

  goBack(): void {
    if (this.isGuest) {
      this.router.navigate(['/guest/guest-assessments']);
    } else {
      this.router.navigate(['/student/my-assessments']);
    }
  }
}
