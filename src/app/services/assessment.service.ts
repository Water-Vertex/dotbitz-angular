import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  Assessment,
  AssessmentFormData,
  AssessmentListResponse,
  Course
} from '../models/assessment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
//   private apiUrl = 'https://dotbitz.com/api/assessments';
  private apiUrl = environment.AdminApiUrl + '/assessments';
  constructor(private http: HttpClient) {}

  // ================= Headers =================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ================= Get All Assessments =================
  getAssessments(): Observable<AssessmentListResponse> {
    return this.http
      .get<AssessmentListResponse>(this.apiUrl, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ================= Get Single Assessment =================
  getAssessment(id: number): Observable<Assessment> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) => res.data ?? res),
        catchError(this.handleError),
      );
  }

  // ================= Create Assessment =================
  createAssessment(data: AssessmentFormData): Observable<Assessment> {
    return this.http
      .post<Assessment>(this.apiUrl, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ================= Update Assessment =================
  updateAssessment(id: number, data: AssessmentFormData): Observable<Assessment> {
    return this.http
      .put<Assessment>(`${this.apiUrl}/${id}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ================= Delete Assessment =================
  deleteAssessment(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ================= Get Courses (for Assessment Dropdown) =================
  getCourses(): Observable<Course[]> {
    return this.http
      .get<any>('https://dotbitz.com/api/courses', {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) => res.data ?? res),
        catchError(this.handleError),
      );
  }

  // ================= Error Handler =================
  private handleError(error: any) {
    console.error('Assessment API Error:', error);
    return throwError(() => error);
  }
}
