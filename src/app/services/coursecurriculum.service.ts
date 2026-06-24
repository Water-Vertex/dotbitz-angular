



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CourseCurriculumPayload,
  CourseCurriculumBulkPayload,
  CourseCurriculumApiResponse,
} from '../models/coursecurriculum.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseCurriculumService {
  private apiUrl = environment.AdminApiUrl + '/course-curriculam';
  private coursesUrl = environment.AdminApiUrl + '/courses';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      Accept: 'application/json',
    });
    // Don't set Content-Type for multipart/form-data
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private getJsonHeaders(): HttpHeaders {
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

  /** Get all curriculums, optional course filter */
  getCurriculums(courseId?: number): Observable<CourseCurriculumApiResponse> {
    let url = this.apiUrl;
    if (courseId) url += `?course_id=${courseId}`;
    return this.http.get<any>(url, { headers: this.getJsonHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching curriculums:', err);
        return throwError(() => err);
      }),
    );
  }

  /** Get single curriculum */
  getCurriculum(id: number): Observable<CourseCurriculumApiResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getJsonHeaders() }).pipe(
      map((res) =>
        res.success !== undefined ? res : { success: true, data: res, message: 'Success' },
      ),
      catchError((err) => {
        console.error(`Error fetching curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * Create curriculum — accepts bulk payload { course_id, items[] }
   * or single payload { course_id, title, duration, description }
   */
  createCurriculum(
    payload: CourseCurriculumPayload | CourseCurriculumBulkPayload | FormData,
  ): Observable<CourseCurriculumApiResponse> {
    // Check if payload is FormData
    if (payload instanceof FormData) {
      return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders() }).pipe(
        catchError((err) => {
          console.error('Error creating curriculum:', err);
          return throwError(() => err);
        }),
      );
    }
    
    // For JSON payload
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getJsonHeaders() }).pipe(
      catchError((err) => {
        console.error('Error creating curriculum:', err);
        return throwError(() => err);
      }),
    );
  }

  /** Update curriculum - accepts both JSON and FormData */
  updateCurriculum(
    id: number,
    payload: CourseCurriculumPayload | FormData,
  ): Observable<CourseCurriculumApiResponse> {
    // Check if payload is FormData
    if (payload instanceof FormData) {
      // For Laravel/PHP: Add _method field for PUT request
      if (!payload.has('_method')) {
        payload.append('_method', 'PUT');
      }
      
      return this.http.post<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
        catchError((err) => {
          console.error(`Error updating curriculum ${id}:`, err);
          return throwError(() => err);
        }),
      );
    }
    
    // For JSON payload
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getJsonHeaders() }).pipe(
      catchError((err) => {
        console.error(`Error updating curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Delete curriculum */
  deleteCurriculum(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getJsonHeaders() }).pipe(
      catchError((err) => {
        console.error(`Error deleting curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Get all courses */
  getCourses(): Observable<any> {
    return this.http.get<any>(this.coursesUrl, { headers: this.getJsonHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching courses:', err);
        return throwError(() => err);
      }),
    );
  }
}