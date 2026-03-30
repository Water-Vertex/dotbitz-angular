import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = environment.AdminApiUrl + '/appointments';

  constructor(private http: HttpClient) {}

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

  // ✅ Get single Appointment
  getAppointment(id: number): Observable<any> {
    console.log(`Fetching Appointment ${id} from ${this.apiUrl}/${id}`);

    return this.http
      .get<any>(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          console.log('Raw Appointment response:', response);

          if (response.success !== undefined) {
            return response;
          } else if (response.id) {
            return {
              success: true,
              data: response,
              message: 'Appointment retrieved successfully',
            };
          } else if (response.data) {
            return { success: true, ...response };
          } else {
            console.error('Unexpected Appointment response structure:', response);
            throw new Error('Invalid Appointment response structure');
          }
        }),
        catchError((error) => {
          console.error(`Error fetching Appointment ${id}:`, error);
          return throwError(() => error);
        }),
      );
  }

  // ✅ Get all Appointments
  getAppointments(): Observable<any> {
    return this.http
      .get<any>(this.apiUrl, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching appointments:', error);
          return throwError(() => error);
        }),
      );
  }

  // Appointment ki course ke assessments fetch karo
  getAssessmentsForAppointment(appointmentId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${appointmentId}/assessments`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) => res.data ?? res),
        catchError((error) => {
          console.error('Error fetching assessments:', error);
          return throwError(() => error);
        }),
      );
  }

  // Assign assessment save karo
  assignAssessment(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl.replace('/appointments', '/assign-assessments')}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error assigning assessment:', error);
          return throwError(() => error);
        }),
      );
  }
}