import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Instructor, Course, CourseApiResponse } from '../models/course.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  // Admin API
  private adminApiUrl = environment.AdminApiUrl + '/courses';
  // Student API
  private studentApiUrl = environment.StudentApiUrl + '/courses';
  private guardianApiUrl = environment.GuardianApiUrl + '/courses';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private getFileHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // --- ADMIN FUNCTIONS ---
  getInstructors(): Observable<{ data: Instructor[] }> {
    return this.http.get<{ data: Instructor[] }>(`${this.adminApiUrl}/instructors`, {
      headers: this.getHeaders(),
    });
  }

  getCourses(search: string = '', perPage: number = 10): Observable<CourseApiResponse> {
    let url = `${this.adminApiUrl}?per_page=${perPage}`;
    if (search) url += `&search=${search}`;
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getCourse(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createCourse(payload: FormData): Observable<CourseApiResponse> {
    return this.http
      .post<CourseApiResponse>(this.adminApiUrl, payload, { headers: this.getFileHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateCourse(id: number, payload: FormData | Course): Observable<CourseApiResponse> {
    if (payload instanceof FormData) {
      return this.http
        .post<CourseApiResponse>(`${this.adminApiUrl}/${id}`, payload, {
          headers: this.getFileHeaders(),
        })
        .pipe(catchError((err) => throwError(() => err)));
    }
    return this.http
      .put<CourseApiResponse>(`${this.adminApiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCourse(id: number): Observable<CourseApiResponse> {
    return this.http
      .delete<CourseApiResponse>(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // --- STUDENT FUNCTIONS ---
  // getStudentCourses(): Observable<CourseApiResponse> {
  //   return this.http
  //     .get<CourseApiResponse>(this.studentApiUrl, { headers: this.getHeaders() })
  //     .pipe(catchError((err) => throwError(() => err)));
  // }

  getStudentCourseDetail(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.studentApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // --- GUARDIAN FUNCTIONS ---

  
  getGuardianCourses(search: string = '', perPage: number = 50): Observable<CourseApiResponse> {
    let url = `${this.guardianApiUrl}?per_page=${perPage}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Fetches a single course detail for the Guardian.
   */
  getGuardianCourseDetail(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.guardianApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
