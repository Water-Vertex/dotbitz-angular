import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Announcement, AnnouncementApiResponse } from '../models/announcement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private adminApiUrl      = environment.AdminApiUrl + '/announcements';
  private instructorApiUrl = environment.InstructorApiUrl + '/announcements';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // ============================================================
  // ADMIN METHODS
  // ============================================================

  getAnnouncements(): Observable<AnnouncementApiResponse> {
    return this.http
      .get<AnnouncementApiResponse>(this.adminApiUrl, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getAnnouncement(id: number): Observable<AnnouncementApiResponse> {
    return this.http
      .get<AnnouncementApiResponse>(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createAnnouncement(payload: Announcement): Observable<AnnouncementApiResponse> {
    return this.http
      .post<AnnouncementApiResponse>(this.adminApiUrl, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateAnnouncement(id: number, payload: Partial<Announcement>): Observable<AnnouncementApiResponse> {
    return this.http
      .put<AnnouncementApiResponse>(`${this.adminApiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteAnnouncement(id: number): Observable<AnnouncementApiResponse> {
    return this.http
      .delete<AnnouncementApiResponse>(`${this.adminApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // Admin dropdown helpers
  getInstructors(): Observable<any> {
    return this.http
      .get<any>(`${this.adminApiUrl}/instructors`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getCourses(): Observable<any> {
    return this.http
      .get<any>(`${this.adminApiUrl}/courses`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getBatches(courseId: number): Observable<any> {
    return this.http
      .get<any>(`${this.adminApiUrl}/batches/${courseId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ============================================================
  // INSTRUCTOR METHODS
  // ============================================================

  getInstructorAnnouncements(): Observable<any> {
    return this.http
      .get<any>(`${this.instructorApiUrl}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getInstructorAnnouncement(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.instructorApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createInstructorAnnouncement(payload: any): Observable<any> {
    return this.http
      .post<any>(`${this.instructorApiUrl}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateInstructorAnnouncement(id: number, payload: any): Observable<any> {
    return this.http
      .put<any>(`${this.instructorApiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteInstructorAnnouncement(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.instructorApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // Instructor dropdown helpers
  getInstructorCourses(): Observable<any> {
    return this.http
      .get<any>(`${this.instructorApiUrl}/courses`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getBatchesByCourse(courseId: number): Observable<any> {
    return this.http
      .get<any>(`${this.instructorApiUrl}/batches/${courseId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getCourseStudentsCount(courseId: number, batchId: number): Observable<any> {
    return this.http
      .get<any>(`${this.instructorApiUrl}/courses/${courseId}/students-count?batchId=${batchId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}