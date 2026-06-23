
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
  private adminApiUrl = environment.AdminApiUrl + '/assessment-attempts';
  // Guest Base URL
  private guestBaseUrl = environment.GuestApiUrl;

  constructor(private http: HttpClient) {}

  // Standard headers for Student & Admin (Token based)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Specific headers for Guest (Email based)
  private getGuestHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Guest-Email': localStorage.getItem('guest_email') || '',
    });
  }

  // ==========================
  // --- STUDENT SIDE METHODS ---
  // ==========================
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


  // Student view attempt (read-only)
viewAttempt(assignAssessmentId: number): Observable<any> {
  return this.http.get(
    `${this.studentBaseUrl}/assessment-view/${assignAssessmentId}`,
    { headers: this.getHeaders() }
  );
}

// Student save progress
saveProgress(attemptId: number, answers: any[]): Observable<any> {
  return this.http.post(
    `${this.studentBaseUrl}/assessment-save-progress/${attemptId}`,
    { answers },
    { headers: this.getHeaders() }
  );
}
  // ==========================
  // --- ADMIN SIDE METHODS ---
  // ==========================
  getAllAttempts(): Observable<any> {
    return this.http.get(`${this.adminApiUrl}`, {
      headers: this.getHeaders(),
    }).pipe(
      catchError((error) => {
        console.error('Error fetching attempts:', error);
        return throwError(() => error);
      })
    );
  }

  getAttemptById(id: number): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  gradeAttempt(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/${id}/grade`, payload, {
      headers: this.getHeaders(),
    });
  }

  // ==========================
  // --- GUEST SIDE METHODS ---
  // ==========================
  checkGuestAttempt(assignAssessmentId: number): Observable<any> {
    return this.http.get(`${this.guestBaseUrl}/assessment-check-attempt/${assignAssessmentId}`, {
      headers: this.getGuestHeaders(),
    });
  }

  guestStartAssessment(assignAssessmentId: number): Observable<any> {
    return this.http.post(
      `${this.guestBaseUrl}/assessment-start/${assignAssessmentId}`,
      {},
      { headers: this.getGuestHeaders() },
    );
  }

  guestSubmitAssessment(attemptId: number, payload: any): Observable<any> {
    return this.http.post(`${this.guestBaseUrl}/assessment-submit/${attemptId}`, payload, {
      headers: this.getGuestHeaders(),
    });
  }



  guestViewAttempt(assignAssessmentId: number): Observable<any> {
    return this.http.get(
      `${this.guestBaseUrl}/assessment-view/${assignAssessmentId}`,
      { headers: this.getGuestHeaders() }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching guest assessment view:', error);
        return throwError(() => error);
      })
    );
  }



// Guest save progress
guestSaveProgress(attemptId: number, answers: any[]): Observable<any> {
  return this.http.post(
    `${this.guestBaseUrl}/assessment-save-progress/${attemptId}`,
    { answers },
    { headers: this.getGuestHeaders() }
  );
}



// assessment-attempt.service.ts mein add karo
// Existing methods ke baad, STUDENT SIDE section mein:

getMyResults(): Observable<any> {
  return this.http.get(
    `${this.studentBaseUrl}/assessment-my-results`,
    { headers: this.getHeaders() }
  ).pipe(
    catchError((error) => {
      console.error('Error fetching student results:', error);
      return throwError(() => error);
    })
  );
}

// GUEST SIDE section mein add karo:

getGuestMyResults(): Observable<any> {
  return this.http.get(
    `${this.guestBaseUrl}/assessment-my-results`,
    { headers: this.getGuestHeaders() }
  ).pipe(
    catchError((error) => {
      console.error('Error fetching guest results:', error);
      return throwError(() => error);
    })
  );
}

 addExemption(data: { student_id: number, course_id: number }): Observable<any> {
  return this.http.post(`${environment.AdminApiUrl}/exemptions`, data, { headers: this.getHeaders() });
}


}
