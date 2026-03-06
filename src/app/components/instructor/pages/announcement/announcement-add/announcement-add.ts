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
  };

  courses: any[] = [];
  loadingCourses = true; // ✅ start as true — spinner shows on page load
  coursesError = '';

  submitting = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private cdr: ChangeDetectorRef, // ✅ added
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loadingCourses = true;
    this.coursesError = '';

    this.announcementService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses = res.data || [];
        this.loadingCourses = false;
        this.cdr.detectChanges(); // ✅ force dropdown to appear
      },
      error: (err) => {
        this.coursesError = err.error?.message || 'Failed to load courses.';
        this.loadingCourses = false;
        this.cdr.detectChanges();
      },
    });
  }

  submit(): void {
    if (!this.form.title || !this.form.message) {
      this.errorMsg = 'Title and message are required.';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.announcementService.createInstructorAnnouncement(this.form).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.successMsg = res.message || 'Announcement created successfully.';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/instructor/announcement/list']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to create announcement.';
        this.cdr.detectChanges();
      },
    });
  }
}
