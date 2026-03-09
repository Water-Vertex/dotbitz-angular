import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';

@Component({
  selector: 'app-announcement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './announcement-edit.html',
})
export class AnnouncementEdit implements OnInit {
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = +id;
      this.loadAnnouncement();
    }
  }

  loadAnnouncement(): void {
    this.announcementService.getAnnouncement(this.id).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.form = { 
          ...data,
          // Format datetime-local value if scheduled_at exists
          scheduled_at: data.scheduled_at ? this.formatDateForInput(data.scheduled_at) : null
        };
        this.alreadySent = data.status === 'sent' && data.sent_at;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading announcement:', err);
        this.errorMsg = 'Failed to load announcement details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    // Validate required fields
    if (!this.form.title || !this.form.title.trim()) {
      this.errorMsg = 'Title is required.';
      return;
    }

    if (!this.form.message || !this.form.message.trim()) {
      this.errorMsg = 'Message is required.';
      return;
    }

    if (this.form.title.length < 3) {
      this.errorMsg = 'Title must be at least 3 characters.';
      return;
    }

    if (this.form.message.length < 10) {
      this.errorMsg = 'Message must be at least 10 characters.';
      return;
    }

    // Validate scheduled date if status is scheduled
    if (this.form.status === 'scheduled' && !this.form.scheduled_at) {
      this.errorMsg = 'Schedule date and time is required.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    // Prepare data for submission
    const submitData = { ...this.form };
    
    // Clear scheduled_at if not scheduled
    if (submitData.status !== 'scheduled') {
      submitData.scheduled_at = null;
    }

    this.announcementService.updateAnnouncement(this.id, submitData).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement updated successfully.';
        setTimeout(() => this.router.navigate(['/admin/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to update announcement.';
        this.cdr.detectChanges();
      }
    });
  }

  onStatusChange(): void {
    // Clear scheduled_at if status is not scheduled
    if (this.form.status !== 'scheduled') {
      this.form.scheduled_at = null;
    }
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }
}