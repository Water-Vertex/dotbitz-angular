import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class AnnouncementAdd implements OnInit {
  form: Announcement = {
    title:                 '',
    message:               '',
    status:                'draft',
    priority:              'normal',
    target_type:           'overall',
    course_id:             null,
    batch_id:              null,
    target_instructor_ids: [],
    scheduled_at:          null,
  };

  instructors: any[] = [];
  courses:     any[] = [];
  batches:     any[] = [];

  submitting = false;
  successMsg = '';
  errorMsg   = '';

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInstructors();
    this.loadCourses();
  }

  loadInstructors(): void {
    this.announcementService.getInstructors().subscribe({
      next: (res: any) => {
        this.instructors = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Instructors error:', err)
    });
  }

  loadCourses(): void {
    this.announcementService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Courses error:', err)
    });
  }

  onCourseChange(): void {
    this.form.batch_id = null;
    this.batches = [];
    if (this.form.course_id) {
      this.announcementService.getBatches(this.form.course_id).subscribe({
        next: (res: any) => {
          this.batches = res.data || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Batches error:', err)
      });
    }
  }

  onTargetTypeChange(): void {
    // Reset target fields on type change
    this.form.course_id             = null;
    this.form.batch_id              = null;
    this.form.target_instructor_ids = [];
    this.batches = [];
  }

  toggleInstructor(id: number): void {
    const ids = this.form.target_instructor_ids || [];
    const idx = ids.indexOf(id);
    if (idx === -1) {
      this.form.target_instructor_ids = [...ids, id];
    } else {
      this.form.target_instructor_ids = ids.filter(i => i !== id);
    }
  }

  isInstructorSelected(id: number): boolean {
    return (this.form.target_instructor_ids || []).includes(id);
  }

  selectAllInstructors(): void {
    this.form.target_instructor_ids = this.instructors.map(i => i.id);
  }

  clearInstructors(): void {
    this.form.target_instructor_ids = [];
  }

  submit(): void {
    if (!this.form.title || !this.form.message) {
      this.errorMsg = 'Title and message are required.';
      return;
    }
    if (this.form.target_type === 'course_batch' && (!this.form.course_id || !this.form.batch_id)) {
      this.errorMsg = 'Please select a course and batch.';
      return;
    }

    this.submitting = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.announcementService.createAnnouncement(this.form).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement created successfully.';
        setTimeout(() => this.router.navigate(['/admin/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg   = err.error?.message || 'Failed to create announcement.';
      }
    });
  }

  onStatusChange(): void {
    // Clear scheduled_at if status is not scheduled
    if (this.form.status !== 'scheduled') {
      this.form.scheduled_at = null;
    }
  }
}