// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { RegistrationRequest, Student, StudentDetail, Guardian } from '../models/student.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class StudentService {
//   private apiUrl = 'http://localhost:8000/api/students'; // same style as CourseService

//   constructor(private http: HttpClient) {}

//   private getHeaders(): HttpHeaders {
//     const token = localStorage.getItem('token') || '';
//     return new HttpHeaders({
//       'Content-Type': 'application/json',
//       Accept: 'application/json',
//       Authorization: `Bearer ${token}`,
//     });
//   }

//   // ---------------- Public ----------------
//   registerStudent(data: RegistrationRequest): Observable<any> {
//     return this.http.post(`${this.apiUrl}/register`, data).pipe(
//       catchError(err => throwError(() => err))
//     );
//   }

//   checkEmailExists(email: string): Observable<{ exists: boolean }> {
//     return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email/${email}`).pipe(
//       catchError(err => throwError(() => err))
//     );
//   }

//   checkUsernameExists(username: string): Observable<{ exists: boolean }> {
//     return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-username/${username}`).pipe(
//       catchError(err => throwError(() => err))
//     );
//   }

//   // ---------------- Authenticated ----------------
//   getStudentById(id: number): Observable<Student> {
//     return this.http.get<Student>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
//       catchError(err => throwError(() => err))
//     );
//   }

//   updateStudent(id: number, data: Partial<Student>): Observable<Student> {
//     return this.http.put<Student>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() }).pipe(
//       catchError(err => throwError(() => err))
//     );
//   }

//   getStudentDetails(studentId: number): Observable<StudentDetail[]> {
//     return this.http
//       .get<StudentDetail[]>(`${this.apiUrl}/${studentId}/education`, { headers: this.getHeaders() })
//       .pipe(catchError(err => throwError(() => err)));
//   }

//   getGuardian(studentId: number): Observable<Guardian> {
//     return this.http
//       .get<Guardian>(`${this.apiUrl}/${studentId}/guardian`, { headers: this.getHeaders() })
//       .pipe(catchError(err => throwError(() => err)));
//   }

//   // ---------------- Admin ----------------
//   getStudents(search: string = ''): Observable<{ data: Student[] }> {
//     let params = new HttpParams();
//     if (search) params = params.set('search', search);

//     return this.http
//       .get<{ data: Student[] }>(`${this.apiUrl}/admin/students`, { headers: this.getHeaders(), params })
//       .pipe(catchError(err => throwError(() => err)));
//   }

//   deleteStudent(id: number): Observable<any> {
//     return this.http
//       .delete(`${this.apiUrl}/admin/students/${id}`, { headers: this.getHeaders() })
//       .pipe(catchError(err => throwError(() => err)));
//   }

//   adminAddStudent(data: RegistrationRequest): Observable<Student> {
//     return this.http
//       .post<Student>(`${this.apiUrl}/admin/students/add`, data, { headers: this.getHeaders() })
//       .pipe(catchError(err => throwError(() => err)));
//   }
// }

// services/student.service.ts
// services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RegistrationRequest, Student, StudentDetail, Guardian } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private apiUrl = 'http://localhost:8000/api/students';
  // private apiUrl = 'https://dotbitz.com/api/students';

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
    return this.http
      .post(`${this.apiUrl}/register`, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.http
      .get<{ exists: boolean }>(`${this.apiUrl}/check-email/${email}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  checkUsernameExists(username: string): Observable<{ exists: boolean }> {
    return this.http
      .get<{ exists: boolean }>(`${this.apiUrl}/check-username/${username}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ---------------- Authenticated ----------------
  getStudentById(id: number): Observable<Student> {
    return this.http
      .get<Student>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateStudent(id: number, data: Partial<Student>): Observable<Student> {
    return this.http
      .put<Student>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getStudentDetails(studentId: number): Observable<StudentDetail[]> {
    return this.http
      .get<StudentDetail[]>(`${this.apiUrl}/${studentId}/education`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getGuardian(studentId: number): Observable<Guardian> {
    return this.http
      .get<Guardian>(`${this.apiUrl}/${studentId}/guardian`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ---------------- Admin ----------------
  getStudents(search: string = ''): Observable<{ data: Student[] }> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);

    return this.http
      .get<{
        data: Student[];
      }>(`${this.apiUrl}/admin/students`, { headers: this.getHeaders(), params })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteStudent(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/admin/students/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  adminAddStudent(data: RegistrationRequest): Observable<Student> {
    return this.http
      .post<Student>(`${this.apiUrl}/admin/students/add`, data, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
