import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { InstructorPayload, InstructorApiResponse } from '../models/instructor.model';

@Injectable({
  providedIn: 'root',
})
export class InstructorService {
  // private apiUrl = 'https://dotbitz.com/api/instructors';
  private apiUrl = 'http://localhost:8000/api/instructors';

  constructor(private http: HttpClient) {}

  /* =========================
     Headers
     ========================= */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /* =========================
   Get All Instructors (with optional search)
   ========================= */
  getInstructors(search: string = ''): Observable<any> {
    let url = this.apiUrl;

    if (search) {
      url += `?search=${encodeURIComponent(search)}`; // Pass search term to API
    }

    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching instructors:', error);
        return throwError(() => error);
      }),
    );
  }

  /* =========================
     Get Single Instructor
     (with details)
     ========================= */
  getInstructor(id: number): Observable<InstructorApiResponse> {
    console.log(`Fetching instructor ${id}`);

    return this.http
      .get<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          console.log('Raw instructor response:', response);

          // Handle different API formats
          if (response.success !== undefined) {
            return response;
          } else if (response.id) {
            return {
              success: true,
              data: response,
              message: 'Instructor retrieved successfully',
            };
          } else if (response.data) {
            return { success: true, ...response };
          } else {
            throw new Error('Invalid instructor response structure');
          }
        }),
        catchError((error) => {
          console.error(`Error fetching instructor ${id}:`, error);
          return throwError(() => error);
        }),
      );
  }

  /* =========================
     Create Instructor
     (Instructor + Details)
     ========================= */
  createInstructor(payload: InstructorPayload): Observable<any> {
    console.log('Creating instructor:', payload);

    return this.http
      .post<any>(this.apiUrl, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error creating instructor:', error);
          return throwError(() => error);
        }),
      );
  }

  /* =========================
     Update Instructor
     (Instructor + Details)
     ========================= */
  updateInstructor(id: number, payload: InstructorPayload): Observable<any> {
    console.log(`Updating instructor ${id}:`, payload);

    return this.http
      .put<any>(`${this.apiUrl}/${id}`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error(`Error updating instructor ${id}:`, error);
          return throwError(() => error);
        }),
      );
  }

  /* =========================
     Delete Instructor
     ========================= */
  deleteInstructor(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error(`Error deleting instructor ${id}:`, error);
          return throwError(() => error);
        }),
      );
  }
}
