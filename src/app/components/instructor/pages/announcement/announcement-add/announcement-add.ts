import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';

@Component({
  selector: 'app-instructor-announcement-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './announcement-add.html',
})
export class InstructorAnnouncementAdd implements OnInit {
  form: Announcement = {
    title: '',
    message: '',
    status: 'draft',
    priority: 'normal',
    scheduled_at: null,
    course_id: undefined,
    batch_id: undefined,
  };

  courses: any[] = [];
  batches: any[] = [];

  loadingCourses = true;
  loadingBatches = false;
  loadingCount = false; // Added for student count loading state
  totalStudents = 0; // Added to store the count

  coursesError = '';
  batchesError = '';

  submitting = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  // ---------------- Load Courses ----------------
  loadCourses(): void {
    this.loadingCourses = true;
    this.coursesError = '';
    this.announcementService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.coursesError = err.error?.message || 'Failed to load courses.';
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ---------------- Load Batches for Selected Course ----------------
  onCourseChange(): void {
    if (!this.form.course_id) {
      this.batches = [];
      this.form.batch_id = undefined;
      this.totalStudents = 0; // Reset count
      return;
    }

    this.loadingBatches = true;
    this.batchesError = '';

    this.announcementService.getBatchesByCourse(this.form.course_id).subscribe({
      next: (res: any) => {
        this.batches = res.data || [];
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.batchesError = err.error?.message || 'Failed to load batches.';
        this.loadingBatches = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ---------------- Get Student Count when Batch is Selected ----------------
  onBatchChange(): void {
    if (!this.form.course_id || !this.form.batch_id) {
      this.totalStudents = 0;
      return;
    }

    this.loadingCount = true;
    this.announcementService
      .getCourseStudentsCount(Number(this.form.course_id), Number(this.form.batch_id))
      .subscribe({
        next: (res: any) => {
          this.totalStudents = res.total_students || 0;
          this.loadingCount = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching student count:', err);
          this.loadingCount = false;
          this.cdr.detectChanges();
        },
      });
  }

  // ---------------- Submit Announcement ----------------
  submit(): void {
    if (!this.form.title || !this.form.message || !this.form.course_id || !this.form.batch_id) {
      this.errorMsg = 'Title, message, course, and batch are required.';
      return;
    }

    const payload = { ...this.form };

    // Convert IDs to numbers
    payload.course_id = Number(payload.course_id);
    payload.batch_id = Number(payload.batch_id);

    // Remove undefined fields safely
    Object.keys(payload).forEach((key) => {
      const k = key as keyof typeof payload;
      if (payload[k] === undefined) {
        delete payload[k];
      }
    });

    console.log('Payload sending to backend:', payload);

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.announcementService.createInstructorAnnouncement(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement created successfully.';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/instructor/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to create announcement.';
        console.log('Backend error response:', err);
        this.cdr.detectChanges();
      },
    });
  }

  onStatusChange(): void {
    // Clear scheduled_at if status is not scheduled
    if (this.form.status !== 'scheduled') {
      this.form.scheduled_at = null;
    }
  }
}