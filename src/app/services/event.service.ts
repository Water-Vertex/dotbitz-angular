import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventService {

  constructor(private http: HttpClient) {}

  private getHeaders(role: 'admin' | 'student' | 'instructor' | 'guardian'): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private baseUrl(role: 'admin' | 'student' | 'instructor' | 'guardian'): string {
    switch (role) {
      case 'admin':      return `${environment.AdminApiUrl}/events`;
      case 'student':    return `${environment.StudentApiUrl}/events`;
      case 'instructor': return `${environment.InstructorApiUrl}/events`;
      case 'guardian':   return `${environment.GuardianApiUrl}/events`;
    }
  }

  // Admin CRUD
  getAdminEvents(): Observable<any> {
    return this.http.get(this.baseUrl('admin'), { headers: this.getHeaders('admin') });
  }

  getAdminEvent(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl('admin')}/${id}`, { headers: this.getHeaders('admin') });
  }

  createEvent(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(this.baseUrl('admin'), formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}`, Accept: 'application/json' })
    });
  }

updateEvent(id: number, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';

    // DON'T append _method here - use POST with _method instead
    // formData.append('_method', 'PUT');  // ← Remove this line

    // Instead, use POST and spoof PUT
    return this.http.post(`${this.baseUrl('admin')}/${id}?_method=PUT`, formData, {
        headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        })
    });
}
  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl('admin')}/${id}`, { headers: this.getHeaders('admin') });
  }

// event.service.ts
getEvents(role: string): Observable<any> {
  const token = localStorage.getItem('token') || '';
  let url = '';

  if (role === 'student') url = `${environment.StudentApiUrl}/events`;
  else if (role === 'instructor') url = `${environment.InstructorApiUrl}/events`;
  else if (role === 'guardian') url = `${environment.GuardianApiUrl}/events`;
  else url = `${environment.AdminApiUrl}/events`;

  return this.http.get(url, {
    headers: new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`
    })
  });
}
}
