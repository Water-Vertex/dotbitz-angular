// src/app/services/google-calendar.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GoogleCalendarService {

  /**
   * Google Calendar event URL generate karo aur open karo
   */
  addToGoogleCalendar(schedule: {
    title: string;
    startTime: string;   // datetime-local format: "2024-06-10T10:00"
    endTime: string;     // datetime-local format: "2024-06-10T11:00"
    description?: string;
    location?: string;   // meeting link
    day?: string;
  }): void {
    const url = this.buildGoogleCalendarUrl(schedule);
    window.open(url, '_blank');
  }

  /**
   * Multiple schedules ke liye ek ek URL open karo
   */
  addMultipleToGoogleCalendar(schedules: Array<{
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    day?: string;
  }>): void {
    schedules.forEach((schedule, index) => {
      setTimeout(() => {
        const url = this.buildGoogleCalendarUrl(schedule);
        window.open(url, '_blank');
      }, index * 500); // slight delay between windows
    });
  }

  private buildGoogleCalendarUrl(schedule: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    day?: string;
  }): string {
    // Format: YYYYMMDDTHHmmssZ
    const start = this.formatToGoogleTime(schedule.startTime);
    const end   = this.formatToGoogleTime(schedule.endTime);

    const params = new URLSearchParams({
      action:  'TEMPLATE',
      text:    schedule.title,
      dates:   `${start}/${end}`,
      details: schedule.description || '',
      location: schedule.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private formatToGoogleTime(datetimeLocal: string): string {
    if (!datetimeLocal) return '';
    // "2024-06-10T10:00" → "20240610T100000Z"
    const cleaned = datetimeLocal.replace(/[-:]/g, '');
    // "20240610T1000" → "20240610T100000"
    const withSeconds = cleaned.includes('T')
      ? cleaned.replace('T', 'T') + '00'
      : cleaned + 'T000000';
    return withSeconds;
  }

  
}