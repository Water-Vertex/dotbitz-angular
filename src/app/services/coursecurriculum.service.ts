import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CourseCurriculumPayload,
  CourseCurriculumApiResponse,
} from '../models/coursecurriculum.model';

@Injectable({
  providedIn: 'root',
})
export class CourseCurriculumService {
  private apiUrl = 'http://localhost:8000/api/course-curricula';
  private coursesUrl = 'http://localhost:8000/api/courses';

  constructor(private http: HttpClient) {}

  /** Headers helper */
  private getHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ Accept: 'application/json' });

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /** Get all curriculums, optional course filter */
  getCurriculums(courseId?: number): Observable<CourseCurriculumApiResponse> {
    let url = this.apiUrl;
    if (courseId) url += `?course_id=${courseId}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching curriculums:', err);
        return throwError(() => err);
      }),
    );
  }

  /** Get single curriculum */
  getCurriculum(id: number): Observable<CourseCurriculumApiResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map((res) => {
        return res.success !== undefined ? res : { success: true, data: res, message: 'Success' };
      }),
      catchError((err) => {
        console.error(`Error fetching curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Create curriculum (FormData compatible) */
  createCurriculum(
    payload: CourseCurriculumPayload | FormData,
  ): Observable<CourseCurriculumApiResponse> {
    const isFormData = payload instanceof FormData;
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders(isFormData) }).pipe(
      catchError((err) => {
        console.error('Error creating curriculum:', err);
        return throwError(() => err);
      }),
    );
  }

  /** Update curriculum (FormData compatible) */
  updateCurriculum(
    id: number,
    payload: CourseCurriculumPayload | FormData,
  ): Observable<CourseCurriculumApiResponse> {
    const isFormData = payload instanceof FormData;

    // If FormData (for file upload), use POST with _method=PUT
    if (isFormData) {
      payload.append('_method', 'PUT');
      return this.http
        .post<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders(true) })
        .pipe(
          catchError((err) => {
            console.error(`Error updating curriculum ${id}:`, err);
            return throwError(() => err);
          }),
        );
    }

    // Otherwise, normal PUT for JSON
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`Error updating curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Delete curriculum */
  deleteCurriculum(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`Error deleting curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Get all courses */
  getCourses(): Observable<any> {
    return this.http.get<any>(this.coursesUrl, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching courses:', err);
        return throwError(() => err);
      }),
    );
  }
}
