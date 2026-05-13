import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EventService } from '../../../../../services/event.service';

@Component({
  selector: 'app-admin-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-list.html',
})
export class AdminEventList implements OnInit {

  events: any[] = [];
  loading  = false;
  deleting: number | null = null;

  constructor(
    private eventService: EventService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadEvents(); }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAdminEvents().subscribe({
      next: (res: any) => {
        this.events  = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  onEdit(id: number): void {
    this.router.navigate(['/admin/events/edit', id]);
  }

  onDelete(id: number): void {
    if (!confirm('Delete this event?')) return;
    this.deleting = id;
    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.events   = this.events.filter(e => e.id !== id);
        this.deleting = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.deleting = null;
        alert('Failed to delete event.');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':    return 'bg-green-100 text-green-700';
      case 'inactive':  return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default:          return 'bg-gray-100 text-gray-600';
    }
  }
}