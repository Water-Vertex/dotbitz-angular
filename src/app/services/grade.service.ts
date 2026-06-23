import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GradeHistoryService {

  constructor(private http: HttpClient) {}

  private getHeaders(role: 'admin' | 'instructor'): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private baseUrl(role: 'admin' | 'instructor'): string {
    return role === 'admin'
      ? `${environment.AdminApiUrl}/grade-history`
      : `${environment.InstructorApiUrl}/grade-history`;
  }

  getCourses(role: 'admin' | 'instructor'): Observable<any> {
    return this.http.get(
      `${this.baseUrl(role)}/courses`,
      { headers: this.getHeaders(role) }
    );
  }

  getBatches(role: 'admin' | 'instructor', courseId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl(role)}/courses/${courseId}/batches`,
      { headers: this.getHeaders(role) }
    );
  }

  getBatchStudents(role: 'admin' | 'instructor', courseId: number, batchId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl(role)}/courses/${courseId}/batches/${batchId}/students`,
      { headers: this.getHeaders(role) }
    );
  }

  getStudentDetail(role: 'admin' | 'instructor', courseId: number, studentId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl(role)}/courses/${courseId}/students/${studentId}`,
      { headers: this.getHeaders(role) }
    );
  }
}