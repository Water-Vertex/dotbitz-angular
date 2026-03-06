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
  private apiUrl = environment.AdminApiUrl + '/announcements';
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

  // ===================== ADMIN METHODS =====================

  getAnnouncements(): Observable<AnnouncementApiResponse> {
    return this.http
      .get<AnnouncementApiResponse>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getAnnouncement(id: number): Observable<AnnouncementApiResponse> {
    return this.http
      .get<AnnouncementApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createAnnouncement(payload: Announcement): Observable<AnnouncementApiResponse> {
    return this.http
      .post<AnnouncementApiResponse>(this.apiUrl, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateAnnouncement(
    id: number,
    payload: Partial<Announcement>,
  ): Observable<AnnouncementApiResponse> {
    return this.http
      .put<AnnouncementApiResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteAnnouncement(id: number): Observable<AnnouncementApiResponse> {
    return this.http
      .delete<AnnouncementApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ===================== INSTRUCTOR METHODS (new) =====================

  // GET all announcements made by instructor
  getInstructorAnnouncements(): Observable<AnnouncementApiResponse> {
    return this.http
      .get<AnnouncementApiResponse>(`${this.instructorApiUrl}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET single announcement
  getInstructorAnnouncement(id: number): Observable<AnnouncementApiResponse> {
    return this.http
      .get<AnnouncementApiResponse>(`${this.instructorApiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET courses taught by logged-in instructor
  getInstructorCourses(): Observable<any> {
    return this.http
      .get<any>(`${this.instructorApiUrl}/courses`, { headers: this.getHeaders() }) // matches backend: /instructor/announcements/courses
      .pipe(catchError((err) => throwError(() => err)));
  }

  // CREATE announcement as instructor (with optional course_id)
  createInstructorAnnouncement(
    payload: Announcement & { course_id?: number },
  ): Observable<AnnouncementApiResponse> {
    return this.http
      .post<AnnouncementApiResponse>(`${this.instructorApiUrl}`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // UPDATE announcement as instructor
  updateInstructorAnnouncement(
    id: number,
    payload: Partial<Announcement>,
  ): Observable<AnnouncementApiResponse> {
    return this.http
      .put<AnnouncementApiResponse>(`${this.instructorApiUrl}/${id}`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // DELETE announcement as instructor
  deleteInstructorAnnouncement(id: number): Observable<AnnouncementApiResponse> {
    return this.http
      .delete<AnnouncementApiResponse>(`${this.instructorApiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
