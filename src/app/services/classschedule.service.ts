// services/class-schedule.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClassSchedule } from '../models/classschedule.model';

@Injectable({
  providedIn: 'root'
})
export class ClassScheduleService {
  private instructorApiUrl = `${environment.InstructorApiUrl}/class-schedules`;

  constructor(private http: HttpClient) {}

  getSchedules(): Observable<any> {
    return this.http.get(this.instructorApiUrl);
  }

  getSchedule(id: number): Observable<any> {
    return this.http.get(`${this.instructorApiUrl}/${id}`);
  }

  createSchedule(data: any): Observable<any> {
    return this.http.post(this.instructorApiUrl, data);
  }

  updateSchedule(id: number, data: any): Observable<any> {
    return this.http.put(`${this.instructorApiUrl}/${id}`, data);
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.instructorApiUrl}/${id}`);
  }

  getCourses(): Observable<any> {
    return this.http.get(`${environment.InstructorApiUrl}/courses`);
  }

  getInstructors(): Observable<any> {
    return this.http.get(`${environment.InstructorApiUrl}/instructors`);
  }
}
