// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-assessment-view',
//   standalone: true,
//   templateUrl: './assessment-view.html',
//   imports: [CommonModule],
// })
// export class AssessmentView implements OnInit {
//   attemptId!: number;
//   attemptData: any = null;
//   loading: boolean = true;
//   correctCount: number = 0;
//   wrongCount: number = 0;
//   totalMcqMarks: number = 0;
//   totalQnaMarks: number = 0;
//   obtainedMcqMarks: number = 0;
//   obtainedQnaMarks: number = 0;

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private attemptService: AssessmentAttemptService,
//     private cdr: ChangeDetectorRef,
//   ) {}

//   ngOnInit(): void {
//     this.route.params.subscribe((params) => {
//       this.attemptId = +params['id'];
//       if (this.attemptId) {
//         this.fetchAttempt();
//       }
//     });
//   }

//   fetchAttempt(): void {
//     this.loading = true;
//     this.attemptService.getAttemptById(this.attemptId).subscribe({
//       next: (res: any) => {
//         console.log('Assessment View Response:', res);

//         let responseData = res;
//         if (res && res.data) {
//           responseData = res.data;
//         }

//         this.attemptData = responseData;

//         // Initialize counters
//         this.correctCount = 0;
//         this.wrongCount = 0;
//         this.totalMcqMarks = 0;
//         this.totalQnaMarks = 0;
//         this.obtainedMcqMarks = 0;
//         this.obtainedQnaMarks = 0;

//         if (this.attemptData?.answers) {
//           this.attemptData.answers.forEach((a: any) => {
//             if (a.assessment_type === 'mcqs') {
//               this.totalMcqMarks += Number(a.marks) || 0;
//               if (a.is_correct === 1) {
//                 this.correctCount++;
//                 this.obtainedMcqMarks += Number(a.marks) || 0;
//               } else {
//                 this.wrongCount++;
//               }
//             }
// else if (a.assessment_type === 'q-a') {
//   this.totalQnaMarks += Number(a.marks) || 0;
//   const obtainedMarks = parseFloat(a.is_correct?.toString() || '0');
//   this.obtainedQnaMarks += obtainedMarks;

//   if (obtainedMarks >= Number(a.marks)) {
//     this.correctCount++;
//   } else if (obtainedMarks > 0) {
//     // partial — don't count as correct or wrong separately
//   } else {
//     this.wrongCount++;
//   }
// }
//           });
//         }

//         this.loading = false;
//         this.cdr.detectChanges();
//       },
//       error: (err) => {
//         console.error('Fetch error:', err);
//         this.loading = false;
//         this.cdr.detectChanges();
//       },
//     });
//   }

//   getQuestionTypeClass(question: any): string {
//     return question.assessment_type === 'mcqs' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';
//   }

//   getQuestionTypeText(question: any): string {
//     return question.assessment_type === 'mcqs' ? 'MCQ' : 'Q&A';
//   }

//   getStatusClass(answer: any): string {
//     if (answer.assessment_type === 'mcqs') {
//       return answer.is_correct === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
//     } else {
//       const obtainedMarks = Number(answer.is_correct) || 0;
//       const totalMarks = Number(answer.marks) || 0;
//       if (obtainedMarks === 0) return 'bg-red-100 text-red-700';
//       if (obtainedMarks === totalMarks) return 'bg-green-100 text-green-700';
//       return 'bg-yellow-100 text-yellow-700';
//     }
//   }

//   getStatusText(answer: any): string {
//     if (answer.assessment_type === 'mcqs') {
//       return answer.is_correct === 1 ? 'Correct' : 'Wrong';
//     } else {
//       const obtainedMarks = Number(answer.is_correct) || 0;
//       const totalMarks = Number(answer.marks) || 0;
//       if (obtainedMarks === 0) return 'Wrong';
//       if (obtainedMarks === totalMarks) return 'Correct';
//       return `Partial (${obtainedMarks}/${totalMarks})`;
//     }
//   }

//   // getObtainedMarks(answer: any): number {
//   //   if (answer.assessment_type === 'mcqs') {
//   //     return answer.is_correct === 1 ? Number(answer.marks) || 0 : 0;
//   //   } else {
//   //     return Number(answer.is_correct) || 0;
//   //   }
//   // }

//   getObtainedMarks(answer: any): number {
//   if (answer.assessment_type === 'mcqs') {
//     return answer.is_correct === 1 ? Number(answer.marks) || 0 : 0;
//   } else {
//     // Q&A: ensure we return decimal value
//     const marks = parseFloat(answer.is_correct?.toString() || '0');
//     return parseFloat(marks.toFixed(2));
//   }
// }

//   getTotalMarks(answer: any): number {
//     return Number(answer.marks) || 0;
//   }

//   /**
//    * Check if obtained marks equal total marks
//    */
//   isFullMarks(answer: any): boolean {
//     return this.getObtainedMarks(answer) === this.getTotalMarks(answer);
//   }

//   /**
//    * Check if obtained marks are partial (greater than 0 but less than total)
//    */
//   isPartialMarks(answer: any): boolean {
//     const obtained = this.getObtainedMarks(answer);
//     const total = this.getTotalMarks(answer);
//     return obtained > 0 && obtained < total;
//   }

//   /**
//    * Get color class for marks display
//    */
//   getMarksColorClass(answer: any): string {
//     if (this.isFullMarks(answer)) return 'text-green-600';
//     if (this.isPartialMarks(answer)) return 'text-yellow-600';
//     return 'text-red-600';
//   }

//   formatOptions(options: any): string[] {
//     if (!options) return [];
//     if (Array.isArray(options)) return options;
//     if (typeof options === 'string') {
//       try {
//         return JSON.parse(options);
//       } catch(e) {
//         return options.split(',').map((opt: string) => opt.trim());
//       }
//     }
//     return [];
//   }
// get totalObtainedMarks(): number {

//   const total = parseFloat((this.obtainedMcqMarks + this.obtainedQnaMarks).toFixed(2));
//   console.log('Total Obtained:', total, 'MCQ:', this.obtainedMcqMarks, 'Q&A:', this.obtainedQnaMarks);
//   return total;
// }

// get totalPossibleMarks(): number {
//   return this.totalMcqMarks + this.totalQnaMarks;
// }

//   goRecheck(): void {
//     this.router.navigate(['admin/assessment/recheck', this.attemptId]);
//   }

//   goBack(): void {
//     this.router.navigate(['/admin/assessment-attempts/list']);
//   }




// }
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-view',
  standalone: true,
  templateUrl: './assessment-view.html',
  imports: [CommonModule],
})
export class AssessmentView implements OnInit {
  attemptId!: number;
  attemptData: any = null;
  loading: boolean = true;
  correctCount: number = 0;
  wrongCount: number = 0;
  totalMcqMarks: number = 0;
  totalQnaMarks: number = 0;
  obtainedMcqMarks: number = 0;
  obtainedQnaMarks: number = 0;

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
        console.log('Assessment View Response:', res);

        let responseData = res;
        if (res && res.data) {
          responseData = res.data;
        }

        this.attemptData = responseData;

        this.correctCount = 0;
        this.wrongCount = 0;
        this.totalMcqMarks = 0;
        this.totalQnaMarks = 0;
        this.obtainedMcqMarks = 0;
        this.obtainedQnaMarks = 0;

        if (this.attemptData?.answers) {
          this.attemptData.answers.forEach((a: any) => {
            if (a.assessment_type === 'mcqs') {
              this.totalMcqMarks += Number(a.marks) || 0;
              if (a.is_correct === 1) {
                this.correctCount++;
                this.obtainedMcqMarks += Number(a.marks) || 0;
              } else {
                this.wrongCount++;
              }
            }
            else if (a.assessment_type === 'q-a') {
              this.totalQnaMarks += Number(a.marks) || 0;

              // ✅ FIX: obtained_marks se marks lo
              let obtainedMarks = 0;
              if (a.obtained_marks !== null && a.obtained_marks !== undefined) {
                obtainedMarks = parseFloat(a.obtained_marks);
              }

              this.obtainedQnaMarks += obtainedMarks;
              console.log(`Q&A Question ${a.question_id}: Obtained Marks = ${obtainedMarks}`);

              if (obtainedMarks >= Number(a.marks)) {
                this.correctCount++;
              } else if (obtainedMarks > 0) {
                // partial marks
              } else {
                this.wrongCount++;
              }
            }
          });
        }

        console.log('Final Totals - MCQ:', this.obtainedMcqMarks, 'Q&A:', this.obtainedQnaMarks);
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

  getQuestionTypeClass(question: any): string {
    return question.assessment_type === 'mcqs' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700';
  }

  getQuestionTypeText(question: any): string {
    return question.assessment_type === 'mcqs' ? 'MCQ' : 'Q&A';
  }

  getStatusClass(answer: any): string {
    if (answer.assessment_type === 'mcqs') {
      return answer.is_correct === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    } else {
      // ✅ FIX: obtained_marks use karo
      const obtainedMarks = parseFloat(answer.obtained_marks?.toString() || '0');
      const totalMarks = Number(answer.marks) || 0;
      if (obtainedMarks === 0) return 'bg-red-100 text-red-700';
      if (obtainedMarks === totalMarks) return 'bg-green-100 text-green-700';
      return 'bg-yellow-100 text-yellow-700';
    }
  }

  getStatusText(answer: any): string {
    if (answer.assessment_type === 'mcqs') {
      return answer.is_correct === 1 ? 'Correct' : 'Wrong';
    } else {
      // ✅ FIX: obtained_marks use karo
      const obtainedMarks = parseFloat(answer.obtained_marks?.toString() || '0');
      const totalMarks = Number(answer.marks) || 0;
      if (obtainedMarks === 0) return 'Wrong';
      if (obtainedMarks === totalMarks) return 'Correct';
      return `Partial (${obtainedMarks}/${totalMarks})`;
    }
  }

  getObtainedMarks(answer: any): number {
    if (answer.assessment_type === 'mcqs') {
      return answer.is_correct === 1 ? Number(answer.marks) || 0 : 0;
    } else {
      // ✅ FIX: obtained_marks use karo
      const marks = parseFloat(answer.obtained_marks?.toString() || '0');
      return parseFloat(marks.toFixed(2));
    }
  }

  getTotalMarks(answer: any): number {
    return Number(answer.marks) || 0;
  }

  isFullMarks(answer: any): boolean {
    return this.getObtainedMarks(answer) === this.getTotalMarks(answer);
  }

  isPartialMarks(answer: any): boolean {
    const obtained = this.getObtainedMarks(answer);
    const total = this.getTotalMarks(answer);
    return obtained > 0 && obtained < total;
  }

  getMarksColorClass(answer: any): string {
    if (this.isFullMarks(answer)) return 'text-green-600';
    if (this.isPartialMarks(answer)) return 'text-yellow-600';
    return 'text-red-600';
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

  get totalObtainedMarks(): number {
    const total = parseFloat((this.obtainedMcqMarks + this.obtainedQnaMarks).toFixed(2));
    console.log('Total Obtained:', total, 'MCQ:', this.obtainedMcqMarks, 'Q&A:', this.obtainedQnaMarks);
    return total;
  }

  get totalPossibleMarks(): number {
    return this.totalMcqMarks + this.totalQnaMarks;
  }

  goRecheck(): void {
    this.router.navigate(['admin/assessment/recheck', this.attemptId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/assessment-attempts/list']);
  }
}
