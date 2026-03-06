import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';

@Component({
  selector: 'app-announcement-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './announcement-add.html',
})
export class AnnouncementAdd {
  form: Announcement = {
    title:    '',
    message:  '',
    status:   'draft',
    priority: 'normal',
    scheduled_at: null,
  };

  submitting = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private announcementService: AnnouncementService,
    private router: Router
  ) {}

  submit(): void {
    if (!this.form.title || !this.form.message) {
      this.errorMsg = 'Title and message are required.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.announcementService.createAnnouncement(this.form).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement created successfully.';
        setTimeout(() => this.router.navigate(['/admin/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to create announcement.';
      }
    });
  }
}