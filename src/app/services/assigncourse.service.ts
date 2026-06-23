import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignCourseService {

  private apiUrl = environment.AdminApiUrl + '/course-instructor';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getAssignments(courseId?: number, instructorId?: number): Observable<any> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (courseId) params.push(`course_id=${courseId}`);
    if (instructorId) params.push(`instructor_id=${instructorId}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAssignment(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createAssignment(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  updateAssignment(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  deleteAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}