import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Batch, BatchPayload, BatchApiResponse } from '../models/batch.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BatchService {

  private apiUrl = environment.AdminApiUrl + '/batches';
  private studentApiUrl = environment.StudentApiUrl + '/batches';
  private guardianApiUrl = environment.GuardianApiUrl + '/batches';
  private instructorApiUrl = environment.InstructorApiUrl + '/batches';

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

  /* ===============================
        ADMIN BATCH METHODS
  ================================= */

  getBatches(search: string = '', perPage: number = 10): Observable<BatchApiResponse> {
    let url = `${this.apiUrl}?per_page=${perPage}`;
    if (search) url += `&search=${search}`;

    return this.http
      .get<BatchApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getBatch(id: number): Observable<BatchApiResponse> {
    return this.http
      .get<BatchApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createBatch(payload: BatchPayload): Observable<BatchApiResponse> {
    return this.http
      .post<BatchApiResponse>(this.apiUrl, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateBatch(id: number, payload: BatchPayload): Observable<BatchApiResponse> {
    return this.http
      .put<BatchApiResponse>(`${this.apiUrl}/${id}`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteBatch(id: number): Observable<BatchApiResponse> {
    return this.http
      .delete<BatchApiResponse>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

   getCoursesByInstructor(id: number) {
    return this.http.get<any>(
      `${environment.AdminApiUrl}/instructors/${id}/courses`,
      { headers: this.getHeaders() }
    );
  }
  getStudentsByCourse(id: number) {
    return this.http.get<any>(
      `${environment.AdminApiUrl}/courses/${id}/students`,
      { headers: this.getHeaders() }
    );
  }
}
