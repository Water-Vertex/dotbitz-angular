import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssessmentAttemptService {
  private studentApiUrl = environment.StudentApiUrl + '/my-assessments';
  private studentBaseUrl = environment.StudentApiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // --- STUDENT SIDE METHOD ---
  getStudentAssessments(): Observable<any> {
    return this.http.get<any>(this.studentApiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching student assessments:', error);
        return throwError(() => error);
      }),
    );
  }

  checkAttempt(assignAssessmentId: number): Observable<any> {
    return this.http.get(`${this.studentBaseUrl}/assessment-check-attempt/${assignAssessmentId}`, {
      headers: this.getHeaders(),
    });
  }

  startAssessment(assignAssessmentId: number): Observable<any> {
    return this.http.post(
      `${this.studentBaseUrl}/assessment-start/${assignAssessmentId}`,
      {},
      { headers: this.getHeaders() },
    );
  }

  submitAssessment(attemptId: number, payload: any): Observable<any> {
    return this.http.post(`${this.studentBaseUrl}/assessment-submit/${attemptId}`, payload, {
      headers: this.getHeaders(),
    });
  }

  myAttempts(): Observable<any> {
    return this.http.get(`${this.studentBaseUrl}/assessment-my-attempts`, {
      headers: this.getHeaders(),
    });
  }
}
