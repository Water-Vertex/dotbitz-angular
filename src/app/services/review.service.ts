import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {

  constructor(private http: HttpClient) {}

  private getHeaders(role: 'admin' | 'student' | 'guardian'): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Public — website
  getPublicReviews(courseId?: number): Observable<any> {
    let url = `${environment.AdminApiUrl.replace('/admin', '')}/reviews`;
    if (courseId) url += `?course_id=${courseId}`;
    return this.http.get(url);
  }

  // Admin
  getAdminReviews(status?: string, courseId?: number): Observable<any> {
    let url = `${environment.AdminApiUrl}/reviews`;
    const params: string[] = [];
    if (status)   params.push(`status=${status}`);
    if (courseId) params.push(`course_id=${courseId}`);
    if (params.length) url += `?${params.join('&')}`;
    const token = localStorage.getItem('token') || '';
    return this.http.get(url, { headers: new HttpHeaders({ Authorization: `Bearer ${token}`, Accept: 'application/json' }) });
  }

  updateReviewStatus(id: number, status: string): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.patch(
      `${environment.AdminApiUrl}/reviews/${id}/status`,
      { status },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }) }
    );
  }

  deleteAdminReview(id: number): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.delete(`${environment.AdminApiUrl}/reviews/${id}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}`, Accept: 'application/json' })
    });
  }

  // Student
  getStudentReviews(): Observable<any> {
    return this.http.get(`${environment.StudentApiUrl}/reviews`, { headers: this.getHeaders('student') });
  }

  submitStudentReview(data: any): Observable<any> {
    return this.http.post(`${environment.StudentApiUrl}/reviews`, data, { headers: this.getHeaders('student') });
  }

  deleteStudentReview(id: number): Observable<any> {
    return this.http.delete(`${environment.StudentApiUrl}/reviews/${id}`, { headers: this.getHeaders('student') });
  }

  // Guardian
  getGuardianReviews(): Observable<any> {
    return this.http.get(`${environment.GuardianApiUrl}/reviews`, { headers: this.getHeaders('guardian') });
  }

  submitGuardianReview(data: any): Observable<any> {
    return this.http.post(`${environment.GuardianApiUrl}/reviews`, data, { headers: this.getHeaders('guardian') });
  }

  deleteGuardianReview(id: number): Observable<any> {
    return this.http.delete(`${environment.GuardianApiUrl}/reviews/${id}`, { headers: this.getHeaders('guardian') });
  }
}
