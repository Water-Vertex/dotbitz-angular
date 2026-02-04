// services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationRequest, Student, StudentDetail, Guardian } from '../models/student.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = environment.apiUrl + '/students';

  constructor(private http: HttpClient) {}

  // Register a new student
  registerStudent(data: RegistrationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Check if email exists
  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email/${email}`);
  }

  // Check if username exists
  checkUsernameExists(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-username/${username}`);
  }

  // Get student by ID
  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  // Update student
  updateStudent(id: number, data: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, data);
  }

  // Get student's education details
  getStudentDetails(studentId: number): Observable<StudentDetail[]> {
    return this.http.get<StudentDetail[]>(`${this.apiUrl}/${studentId}/education`);
  }

  // Get student's guardian
  getGuardian(studentId: number): Observable<Guardian> {
    return this.http.get<Guardian>(`${this.apiUrl}/${studentId}/guardian`);
  }
}
