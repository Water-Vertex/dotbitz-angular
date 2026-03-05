import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssignmentPayload, AssignmentApiResponse } from '../models/assignment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  private apiUrl = environment.AdminApiUrl + '/assignments';
  private coursesUrl = environment.AdminApiUrl + '/courses';
  private StudentApiUrl = environment.StudentApiUrl + '/assignments';
  private guardianApiUrl = environment.GuardianApiUrl + '/courses';

  constructor(private http: HttpClient) {}

  /** =========================
   *  Headers helper
   *  ========================= */
  private getHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      Accept: 'application/json',
    });

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /** =========================
   *  Get All Assignments
   *  ========================= */
  getAssignments(courseId?: number): Observable<AssignmentApiResponse> {
    let url = this.apiUrl;
    if (courseId) url += `?course_id=${courseId}`;

    return this.http.get<AssignmentApiResponse>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching assignments:', err);
        return throwError(() => err);
      }),
    );
  }

  /** =========================
   *  Get Single Assignment
   *  ========================= */
  getAssignment(id: number): Observable<AssignmentApiResponse> {
    return this.http
      .get<AssignmentApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError((err) => {
          console.error(`Error fetching assignment ${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  /** =========================
   *  Create Assignment
   *  Supports file upload
   *  ========================= */
  createAssignment(payload: AssignmentPayload | FormData): Observable<AssignmentApiResponse> {
    const isFormData = payload instanceof FormData;

    return this.http
      .post<AssignmentApiResponse>(this.apiUrl, payload, { headers: this.getHeaders(isFormData) })
      .pipe(
        catchError((err) => {
          console.error('Error creating assignment:', err);
          return throwError(() => err);
        }),
      );
  }

  /** =========================
   *  Update Assignment
   *  Supports file upload
   *  ========================= */
  updateAssignment(
    id: number,
    payload: AssignmentPayload | FormData,
  ): Observable<AssignmentApiResponse> {
    const isFormData = payload instanceof FormData;

    // For FormData (file upload) we can send POST with _method=PUT
    if (isFormData) {
      payload.append('_method', 'PUT');
      return this.http
        .post<AssignmentApiResponse>(`${this.apiUrl}/${id}`, payload, {
          headers: this.getHeaders(true),
        })
        .pipe(
          catchError((err) => {
            console.error(`Error updating assignment ${id}:`, err);
            return throwError(() => err);
          }),
        );
    }

    // Otherwise normal PUT
    return this.http
      .put<AssignmentApiResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(
        catchError((err) => {
          console.error(`Error updating assignment ${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  /** =========================
   *  Delete Assignment
   *  ========================= */
  deleteAssignment(id: number): Observable<AssignmentApiResponse> {
    return this.http
      .delete<AssignmentApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError((err) => {
          console.error(`Error deleting assignment ${id}:`, err);
          return throwError(() => err);
        }),
      );
  }

  /** =========================
   *  Get Courses (for dropdown)
   *  ========================= */
  getCourses(): Observable<any> {
    return this.http.get<any>(this.coursesUrl, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching courses:', err);
        return throwError(() => err);
      }),
    );
  }



  /** =========================
 *  Student - Get Assignments by Course
 *  ========================= */
getAssignmentsByCourse(courseId: number): Observable<any> {
  return this.http
    .get<any>(`${this.StudentApiUrl}/course/${courseId}`, {
      headers: this.getHeaders()
    })
    .pipe(
      catchError((err) => {
        console.error('Error fetching assignments by course:', err);
        return throwError(() => err);
      }),
    );
}
 /** =========================
   * Guardian: Get Assignments by Course
   * ========================= */
  getAssignmentsGuardian(courseId: number): Observable<AssignmentApiResponse> {
    const token = localStorage.getItem('token');

    // Correct URL: only one 'courses'
    const url = `${this.guardianApiUrl}/${courseId}/assignments`;

    console.log('Requesting URL:', url); // For debugging

    return this.http
      .get<AssignmentApiResponse>(url, {
        headers: new HttpHeaders({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      })
      .pipe(
        catchError((err) => {
          console.error(`Error fetching guardian assignments for course ${courseId}:`, err);
          return throwError(() => err);
        }),
      );
  }
}