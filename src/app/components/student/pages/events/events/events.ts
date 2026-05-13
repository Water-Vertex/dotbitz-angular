import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../../../services/event.service';
import { GoogleCalendarService } from '../../../../../services/google-calendar.service';

@Component({
  selector: 'app-student-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.html',
})
export class StudentEvents implements OnInit {

  role='student';

  events: any[] = [];
  loading = false;

  constructor(
    private eventService: EventService,
    private googleCalendar: GoogleCalendarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadEvents(); }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents('student').subscribe({
      next: (res: any) => {
        this.events  = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  addToCalendar(event: any): void {
    this.googleCalendar.addToGoogleCalendar({
      title:       event.name,
      startTime:   event.start_time,
      endTime:     event.end_time || event.start_time,
      location:    event.location || '',
      description: [
        event.description || '',
        event.location ? `📍 ${event.location}` : '',
      ].filter(Boolean).join('\n'),
    });
  }

  isUpcoming(dateStr: string): boolean {
    return new Date(dateStr) >= new Date(new Date().toDateString());
  }
}