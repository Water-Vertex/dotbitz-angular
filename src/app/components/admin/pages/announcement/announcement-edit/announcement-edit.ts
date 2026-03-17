import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';

@Component({
  selector: 'app-announcement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './announcement-edit.html',
})
export class AnnouncementEdit implements OnInit {
  form: Announcement = {
    title: '',
    message: '',
    status: 'draft',
    priority: 'normal',
    target_type: 'overall',
    course_id: null,
    batch_id: null,
    target_instructor_ids: [],
    scheduled_at: null,
  };

  instructors: any[] = [];
  courses: any[] = [];
  batches: any[] = [];

  loading = false;
  submitting = false;
  alreadySent = false;
  successMsg = '';
  errorMsg = '';
  announcementId!: number;

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.announcementId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.announcementId) {
      this.loadAnnouncement();
      this.loadInstructors();
      this.loadCourses();
    } else {
      this.errorMsg = 'Invalid announcement ID';
    }
  }

  loadAnnouncement(): void {
    this.loading = true;
    this.announcementService.getAnnouncement(this.announcementId).subscribe({
      next: (res: any) => {
        this.form = { ...res.data };
        this.alreadySent = this.form.status === 'sent';

        // If it's a course_batch type and has course_id, load batches
        if (this.form.target_type === 'course_batch' && this.form.course_id) {
          this.loadBatchesForCourse(this.form.course_id);
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to load announcement';
        console.error('Load announcement error:', err);
      },
    });
  }

  loadInstructors(): void {
    this.announcementService.getInstructors().subscribe({
      next: (res: any) => {
        this.instructors = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Instructors error:', err),
    });
  }

  loadCourses(): void {
    this.announcementService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Courses error:', err),
    });
  }

  loadBatchesForCourse(courseId: number): void {
    this.announcementService.getBatches(courseId).subscribe({
      next: (res: any) => {
        this.batches = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Batches error:', err),
    });
  }

  onCourseChange(): void {
    this.form.batch_id = null;
    this.batches = [];
    if (this.form.course_id) {
      this.loadBatchesForCourse(this.form.course_id);
    }
  }

  onTargetTypeChange(): void {
    // Don't allow target type change if already sent
    if (this.alreadySent) return;

    // Reset target fields on type change
    this.form.course_id = null;
    this.form.batch_id = null;
    this.form.target_instructor_ids = [];
    this.batches = [];
  }

  toggleInstructor(id: number): void {
    if (this.alreadySent) return;

    const ids = this.form.target_instructor_ids || [];
    const idx = ids.indexOf(id);
    if (idx === -1) {
      this.form.target_instructor_ids = [...ids, id];
    } else {
      this.form.target_instructor_ids = ids.filter((i) => i !== id);
    }
  }

  isInstructorSelected(id: number): boolean {
    return (this.form.target_instructor_ids || []).includes(id);
  }

  selectAllInstructors(): void {
    if (this.alreadySent) return;
    this.form.target_instructor_ids = this.instructors.map((i) => i.id);
  }

  clearInstructors(): void {
    if (this.alreadySent) return;
    this.form.target_instructor_ids = [];
  }

  onStatusChange(): void {
    // Clear scheduled_at if status is not scheduled
    if (this.form.status !== 'scheduled') {
      this.form.scheduled_at = null;
    }
  }

  submit(): void {
    // Validation
    if (!this.form.title || !this.form.message) {
      this.errorMsg = 'Title and message are required.';
      return;
    }

    if (this.form.target_type === 'course_batch' && (!this.form.course_id || !this.form.batch_id)) {
      this.errorMsg = 'Please select a course and batch.';
      return;
    }

    // Don't allow status change to 'sent' if already sent
    if (this.alreadySent && this.form.status === 'sent') {
      this.errorMsg = 'This announcement has already been sent and cannot be sent again.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.announcementService.updateAnnouncement(this.announcementId, this.form).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement updated successfully.';
        setTimeout(() => this.router.navigate(['/admin/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to update announcement.';
        console.error('Update error:', err);
      },
    });
  }
}
