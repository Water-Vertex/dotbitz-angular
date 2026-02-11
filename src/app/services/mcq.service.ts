

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Mcq } from '../models/mcq.model';
import { Course } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class McqService {
  // ✅ BASE URLs - properly defined
  private apiUrl = 'https://dotbitz.com/api/mcqs';           // Public MCQ routes
  private adminApiUrl = 'https://dotbitz.com/api/mcqs'; // Admin MCQ routes
  private courseApiUrl = 'https://dotbitz.com/api/courses';   // Course routes

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // =================== MCQ METHODS ===================

  /**
   * Get all MCQs (Public route - no auth needed)
   */
 getAllMcqs(): Observable<Mcq[]> {
  return this.http
    .get<Mcq[]>(this.apiUrl) // ✅ NO HEADERS
    .pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(err => throwError(() => err))
    );
}


  /**
   * Get single MCQ by ID
   */
  getMcq(id: number): Observable<Mcq> {
    return this.http
      .get<Mcq>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  /**
   * Create new MCQ (Admin route - needs auth)
   */
  createMcq(mcq: Mcq): Observable<Mcq> {
    return this.http
      .post<Mcq>(`${this.adminApiUrl}/add`, mcq, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          console.log('MCQ Created:', response);
          return response;
        }),
        catchError(err => {
          console.error('Error creating MCQ:', err);
          return throwError(() => err);
        })
      );
  }

  createMultipleMcqs(mcqs: Mcq[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, mcqs);
  }
  /**
   * Update MCQ (Admin route - needs auth)
   */
  updateMcq(id: number, mcq: Mcq): Observable<Mcq> {
    return this.http
      .put<Mcq>(`${this.adminApiUrl}/${id}`, mcq, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  /**
   * Delete MCQ (Admin route - needs auth)
   */
  deleteMcq(id: number): Observable<any> {
    return this.http
      .delete(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }


  // =================== COURSE METHODS ===================

  /**
   * Get all courses from database
   */
  getAllCourses(): Observable<Course[]> {
    return this.http
      .get<any>(this.courseApiUrl, { headers: this.getHeaders() })
      .pipe(
        map(res => {
          console.log('Courses Response:', res); // Debug
          // Handle different response formats
          if (res?.data && Array.isArray(res.data)) {
            return res.data;
          }
          if (Array.isArray(res)) {
            return res;
          }
          return [];
        }),
        catchError(err => {
          console.error('Courses API failed:', err);
          return throwError(() => err);
        })
      );
  }

  /**
   * Get single course by ID
   */
  getCourse(id: number): Observable<Course> {
    return this.http
      .get<any>(`${this.courseApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response?.data) {
            return response.data;
          }
          return response;
        }),
        catchError(err => throwError(() => err))
      );
  }
}
