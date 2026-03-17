import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';

@Component({
  selector: 'app-instructor-announcement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './announcement-edit.html',
})
export class InstructorAnnouncementEdit implements OnInit {
  form: Partial<Announcement> = {};
  id!: number;
  loading = true;
  submitting = false;
  successMsg = '';
  errorMsg = '';
  alreadySent = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = +id;
      this.loadAnnouncement();
    }
  }

  loadAnnouncement(): void {
    this.announcementService.getInstructorAnnouncement(this.id).subscribe({
      next: (res: any) => {
        this.form = { ...res.data };

        // Ensure the alreadySent logic stays the same
        this.alreadySent = res.data.status === 'sent' && !!res.data.sent_at;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Could not find announcement.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  submit(): void {
    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.announcementService.updateInstructorAnnouncement(this.id, this.form).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement updated successfully.';
        setTimeout(() => this.router.navigate(['/instructor/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to update announcement.';
      },
    });
  }
}
