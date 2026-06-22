import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  course_id: number | string; 
  appointment_date: string;
  appointment_time: string;
  message: string;
  created_at: string;
  course?: {
    id: number;
    course_name: string;
    course_code: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = environment.AdminApiUrl;

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<{ success: boolean; data: Appointment[] }> {
  return this.http.get<{ success: boolean; data: Appointment[] }>(
    `${this.apiUrl}/appointments`
  );
}

  deleteAppointment(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/appointments/${id}`
    );
  }
}