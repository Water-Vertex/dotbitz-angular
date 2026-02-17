import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Instructor, Course, CourseApiResponse } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  // private apiUrl = 'http://localhost:8000/api/courses';
private apiUrl = 'http://localhost:8000/api/admin/courses';
  // private apiUrl = 'https://dotbitz.com/api/courses';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // File upload ke liye special headers (No Content-Type)
  private getFileHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getInstructors(): Observable<{ data: Instructor[] }> {
    return this.http.get<{ data: Instructor[] }>('https://dotbitz.com/api/instructors', {
      headers: this.getHeaders(),
    });
  }

  getCourses(search: string = '', perPage: number = 10): Observable<CourseApiResponse> {
    let url = `${this.apiUrl}?per_page=${perPage}`;
    if (search) url += `&search=${search}`;
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getCourse(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createCourse(payload: FormData): Observable<CourseApiResponse> {
    return this.http
      .post<CourseApiResponse>(this.apiUrl, payload, { headers: this.getFileHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // --- MODIFIED FOR EDIT WITH IMAGE ---
  updateCourse(id: number, payload: FormData | Course): Observable<CourseApiResponse> {
    // Agar payload FormData hai (image upload ke liye),
    // to hum POST use karenge Method Spoofing ke saath
    if (payload instanceof FormData) {
      return this.http
        .post<CourseApiResponse>(`${this.apiUrl}/${id}`, payload, {
          headers: this.getFileHeaders(),
        })
        .pipe(catchError((err) => throwError(() => err)));
    }

    // Normal PUT request agar sirf JSON data hai
    return this.http
      .put<CourseApiResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCourse(id: number): Observable<CourseApiResponse> {
    return this.http
      .delete<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
