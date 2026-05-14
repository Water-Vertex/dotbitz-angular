// src/app/services/ticket.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {

  constructor(private http: HttpClient) {}

  private getHeaders(role: 'student' | 'guardian'): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private baseUrl(role: 'student' | 'guardian'): string {
    return role === 'student'
      ? `${environment.StudentApiUrl}/support-tickets`
      : `${environment.GuardianApiUrl}/support-tickets`;
  }

  getTickets(role: 'student' | 'guardian'): Observable<any> {
    return this.http.get(this.baseUrl(role), { headers: this.getHeaders(role) });
  }

  getTicket(role: 'student' | 'guardian', id: number): Observable<any> {
    return this.http.get(`${this.baseUrl(role)}/${id}`, { headers: this.getHeaders(role) });
  }

  createTicket(role: 'student' | 'guardian', data: any): Observable<any> {
    return this.http.post(this.baseUrl(role), data, { headers: this.getHeaders(role) });
  }

  updateTicket(role: 'student' | 'guardian', id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl(role)}/${id}`, data, { headers: this.getHeaders(role) });
  }

  deleteTicket(role: 'student' | 'guardian', id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl(role)}/${id}`, { headers: this.getHeaders(role) });
  }

  // ticket.service.ts mein admin methods add karo

getAdminTickets(status?: string, search?: string): Observable<any> {
  let url = `${environment.AdminApiUrl}/support-tickets`;
  const params: string[] = [];
  if (status) params.push(`status=${status}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length) url += `?${params.join('&')}`;
  const token = localStorage.getItem('token') || '';
  return this.http.get(url, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    })
  });
}

replyTicket(ticketId: number, reply: string): Observable<any> {
  const token = localStorage.getItem('token') || '';
  return this.http.post(
    `${environment.AdminApiUrl}/support-tickets/${ticketId}/reply`,
    { reply },
    { headers: new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }) }
  );
}

updateTicketStatus(ticketId: number, status: string): Observable<any> {
  const token = localStorage.getItem('token') || '';
  return this.http.patch(
    `${environment.AdminApiUrl}/support-tickets/${ticketId}/status`,
    { status },
    { headers: new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }) }
  );
}

viewTicketReply(role: 'student' | 'guardian', id: number): Observable<any> {
  return this.http.get(
    `${role === 'student' ? environment.StudentApiUrl : environment.GuardianApiUrl}/support-tickets/${id}`,
    { headers: this.getHeaders(role) }
  );
}
}