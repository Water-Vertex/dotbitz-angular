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


  // Get schedules by batch
  getSchedulesByBatch(batchId: number): Observable<any> {
    return this.http.get(`${this.instructorApiUrl}/batch/${batchId}`);
  }

  // Create multiple schedules (for recurring classes)
  createSchedules(schedules: any[]): Observable<any> {
    return this.http.post(this.instructorApiUrl, schedules);
  }

  // Update multiple schedules
  updateSchedules(id: number, schedules: any[]): Observable<any> {
    return this.http.put(`${this.instructorApiUrl}/multiple/${id}`, schedules);
  }

  // Delete single schedule
  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.instructorApiUrl}/${id}`);
  }

  // Delete multiple schedules
  deleteSchedules(ids: number[]): Observable<any> {
    return this.http.delete(this.instructorApiUrl, { body: { ids } });
  }


  getCourses(): Observable<any> {
    return this.http.get(`${environment.InstructorApiUrl}/courses`);
  }

  getInstructors(): Observable<any> {
    return this.http.get(`${environment.InstructorApiUrl}/instructors`);
  }

  // Get batches by course (NEW)
  getBatchesByCourse(courseId: number): Observable<any> {
    return this.http.get(`${environment.InstructorApiUrl}/courses/${courseId}/batches`);
  }

getStudentCourses(): Observable<any> {
  return this.http.get(`${environment.StudentApiUrl}/student-courses`);
}
  getStudentSchedulesByCourse(courseId: number): Observable<any> {
  return this.http.get(`${environment.StudentApiUrl}/courses/${courseId}/schedules`);
}
getMySchedules(batchId: number): Observable<any> {
  return this.http.get(
    `${environment.StudentApiUrl}/class-schedules/batch/${batchId}`
  );
}
getGuardianStudentSchedules(studentId: number): Observable<any> {
  return this.http.get(`${environment.GuardianApiUrl}/student/${studentId}/schedules`);
}


}
