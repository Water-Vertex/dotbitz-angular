import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Instructor,Course, CourseApiResponse } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private apiUrl = 'http://localhost:8000/api/courses';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getInstructors(): Observable<{ data: Instructor[] }> {
  return this.http.get<{ data: Instructor[] }>('http://localhost:8000/api/instructors', { headers: this.getHeaders() });
}
  getCourses(search: string = '', perPage: number = 10): Observable<CourseApiResponse> {
    let url = `${this.apiUrl}?per_page=${perPage}`;
    if (search) url += `&search=${search}`;
    return this.http.get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  getCourse(id: number): Observable<CourseApiResponse> {
    return this.http.get<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }
  
  // getCourse(id: number): Observable<CourseApiResponse> {
  //   return this.http.get<CourseApiResponse>(`${this.apiUrl}/courses/${id}`);
  // }

  createCourse(payload: Course): Observable<CourseApiResponse> {
    return this.http.post<CourseApiResponse>(this.apiUrl, payload, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  updateCourse(id: number, payload: Course): Observable<CourseApiResponse> {
    return this.http.put<CourseApiResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  deleteCourse(id: number): Observable<CourseApiResponse> {
    return this.http.delete<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }
}
