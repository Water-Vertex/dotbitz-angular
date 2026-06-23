
// services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError,tap } from 'rxjs/operators';
import { RegistrationRequest, Student, StudentDetail, Guardian } from '../models/student.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentService {

 private AdminApiUrl = environment.AdminApiUrl + '/students';
 private InstructorApiUrl = environment.InstructorApiUrl + '/students';
 private StudentApiUrl = environment.StudentApiUrl;


  constructor(private http: HttpClient) {}

  // ---------------- Headers ----------------
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // ---------------- Public ----------------
  registerStudent(data: RegistrationRequest): Observable<any> {
    return this.http.post(`${this.StudentApiUrl}/register`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.StudentApiUrl}/check-email/${email}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  checkUsernameExists(username: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.StudentApiUrl}/check-username/${username}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // ---------------- Authenticated ----------------
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.StudentApiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateStudent(id: number, data: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.AdminApiUrl}/${id}`, data, { headers: this.getHeaders() }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getStudentDetails(studentId: number): Observable<StudentDetail[]> {
    return this.http
      .get<StudentDetail[]>(`${this.AdminApiUrl}/${studentId}/education`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  getGuardian(studentId: number): Observable<Guardian> {
    return this.http
      .get<Guardian>(`${this.AdminApiUrl}/${studentId}/guardian`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  // ---------------- Admin ----------------
  getStudents(search: string = ''): Observable<{ data: Student[] }> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);

    return this.http
      .get<{ data: Student[] }>(`${this.AdminApiUrl}`, { headers: this.getHeaders(), params })
      .pipe(catchError(err => throwError(() => err)));
  }

  deleteStudent(id: number): Observable<any> {
    return this.http
      .delete(`${this.AdminApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  adminAddStudent(data: RegistrationRequest): Observable<Student> {
    return this.http
      .post<Student>(`${this.AdminApiUrl}/register`, data, { headers: this.getHeaders() })
      .pipe(catchError(err => throwError(() => err)));
  }

  getProfile(): Observable<any> {
      console.log('🔷 Service: getProfile() called');
      console.log('🔷 API URL:', `${this.StudentApiUrl}/profile`);
      console.log('🔷 Token exists:', !!localStorage.getItem('token'));

      return this.http.get(`${this.StudentApiUrl}/profile`, {
        headers: this.getHeaders()
      }).pipe(
        tap(response => {
          console.log('✅ Service: Response received:', response);
        }),
      catchError(err => {
        console.error('❌ Service: Request failed:', err);
        console.error('❌ Service: Error status:', err.status);
        console.error('❌ Service: Error body:', err.error);
        return throwError(() => err);
      })
    );
  }

  updateProfile(data: Partial<Student>): Observable<any> {
    return this.http.put(`${this.StudentApiUrl}/profile`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  //InstructorStudentList

getInstructorStudents(search: string = ''): Observable<{ data: Student[] }> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);

    return this.http
      .get<{ data: Student[] }>(`${this.InstructorApiUrl}`, { headers: this.getHeaders(), params })
      .pipe(catchError(err => throwError(() => err)));
  }

resetPassword(data: { new_password: string; confirm_password: string }): Observable<any> {
  return this.http.post(`${this.StudentApiUrl}/reset-password`, data, { 
    headers: this.getHeaders() 
  }).pipe(
    catchError(err => throwError(() => err))
  );
}

}


