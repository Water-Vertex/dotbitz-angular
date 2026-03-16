import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Add this import
import { AnnouncementService } from '../../../../../services/announcement.service';
import { Announcement } from '../../../../../models/announcement.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-instructor-announcement-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // Add FormsModule here
  templateUrl: './announcement-list.html',
})
export class InstructorAnnouncementList implements OnInit {
  announcements: Announcement[] = [];
  filteredAnnouncements: Announcement[] = []; // Add filtered array
  loading = true;
  deletingId: number | null = null;
  searchTerm: string = '';
  totalItems: number = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private announcementService: AnnouncementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
    
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filterAnnouncements(searchTerm);
    });
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getInstructorAnnouncements().subscribe({
      next: (res: any) => {
        this.announcements = Array.isArray(res.data) ? res.data : [];
        this.filteredAnnouncements = [...this.announcements]; // Initialize filtered array
        this.loading = false;
        this.totalItems = this.announcements.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading instructor announcements:', err);
        this.loading = false;
        this.totalItems = this.announcements.length;
        this.filteredAnnouncements = [...this.announcements];
        this.cdr.detectChanges();
      }
    });
  }

  // Add filter method
  filterAnnouncements(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredAnnouncements = [...this.announcements];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredAnnouncements = this.announcements.filter(a => 
        a.title.toLowerCase().includes(term) ||
        a.message.toLowerCase().includes(term)
      );
    }
    this.totalItems = this.filteredAnnouncements.length;
    this.cdr.detectChanges();
  }

  deleteAnnouncement(id: number): void {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    this.deletingId = id;
    this.announcementService.deleteInstructorAnnouncement(id).subscribe({
      next: () => {
        this.announcements = this.announcements.filter(a => a.id !== id);
        this.filteredAnnouncements = this.filteredAnnouncements.filter(a => a.id !== id);
        this.deletingId = null;
        this.totalItems = this.filteredAnnouncements.length;
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
    switch (priority?.toLowerCase()) {
      case 'high':   return 'bg-red-100 text-red-700';
      case 'normal': return 'bg-yellow-100 text-yellow-700';
      case 'low':    return 'bg-green-100 text-green-700';
      default:       return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'sent':      return 'bg-green-100 text-green-700';
      case 'draft':     return 'bg-gray-100 text-gray-600';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  }

  refreshData(): void {
    console.log('Manual refresh triggered');
    this.loadAnnouncements();
    this.searchTerm = ''; // Clear search on refresh
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }

  trackById(index: number, announcement: any): number {
    return announcement.id;
  }
}