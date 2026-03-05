import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './announcement-list.html',
})
export class AnnouncementList implements OnInit {
  announcements: Announcement[] = [];
  loading = true;
  deletingId: number | null = null;

  constructor(
    private announcementService: AnnouncementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getAnnouncements().subscribe({
      next: (res: any) => {
        this.announcements = Array.isArray(res.data) ? res.data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading announcements:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteAnnouncement(id: number): void {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    this.deletingId = id;
    this.announcementService.deleteAnnouncement(id).subscribe({
      next: () => {
        this.announcements = this.announcements.filter(a => a.id !== id);
        this.deletingId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.deletingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':   return 'bg-red-100 text-red-700';
      case 'normal': return 'bg-yellow-100 text-yellow-700';
      case 'low':    return 'bg-green-100 text-green-700';
      default:       return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'sent':      return 'bg-green-100 text-green-700';
      case 'draft':     return 'bg-gray-100 text-gray-600';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  }
}