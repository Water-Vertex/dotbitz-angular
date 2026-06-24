import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // CDR add kiya
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentAttemptService } from '../../../../../services/assessmentattempt.service';

@Component({
  selector: 'app-guest-assessment-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-view.html',
  styleUrl: './assessment-view.css',
})
export class GuestAssessmentView implements OnInit, OnDestroy {
  isLoading = true;
  attemptData: any = null;
  assignAssessmentId!: number;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: AssessmentAttemptService,
    private cdr: ChangeDetectorRef // Inject CDR
  ) {}

  ngOnInit(): void {
    this.assignAssessmentId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Guest Assessment ID:', this.assignAssessmentId); // Console Log 1
    this.loadAttempt();
  }

  loadAttempt(): void {
    this.isLoading = true;
    console.log('Starting Guest API call...');

    this.attemptService
      .guestViewAttempt(this.assignAssessmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          console.log('Guest API Raw Response:', res); // Console Log 2

          if (res && res.data) {
            this.attemptData = res.data;
          } else {
            this.attemptData = res;
          }

          this.isLoading = false;

          // Force UI to update
          this.cdr.detectChanges();
          console.log('Guest Attempt Data assigned:', this.attemptData); // Console Log 3
          console.log('isLoading set to false. UI should render now.');
        },
        error: (err: any) => {
          console.error('Guest API Error:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/guest/guest-assessments']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
