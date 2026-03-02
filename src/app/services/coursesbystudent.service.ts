import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError , of} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CoursesByStudentService {
  private apiUrl = environment.StudentApiUrl + '/my-courses';
  private guardianApiUrl = environment.GuardianApiUrl;

  // Caching Variables
  private studentsCache: any = null;
  private coursesCache: Map<number, any> = new Map();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getMyEnrolledCourses(): Observable<any> {
    return this.http
      .get(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getEnrollmentDetail(id: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

   getGuardianStudents(): Observable<any> {
    // Agar data pehle se hai, to foran return kar dein
    if (this.studentsCache) {
      return of(this.studentsCache);
    }

    return this.http.get(`${this.guardianApiUrl}/students`, { headers: this.getHeaders() }).pipe(
      tap((data) => (this.studentsCache = data)), // Data save karlein next time ke liye
      catchError((err) => throwError(() => err)),
    );
  }

  /**
   * Fetch Courses by student (With Student-specific Caching)
   */
  getCoursesByStudent(studentId: number): Observable<any> {
     // Agar is student ke courses pehle load ho chuke hain, to wahi dikhayen
    if (this.coursesCache.has(studentId)) {
      return of(this.coursesCache.get(studentId));
    }

    return this.http
      .get(`${this.guardianApiUrl}/student-courses/${studentId}`, { headers: this.getHeaders() })
      .pipe(
        tap((data) => this.coursesCache.set(studentId, data)), // Store in map
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Clear Cache (Jab student add ho ya data refresh karna ho)
   */
  clearCache(): void {
    this.studentsCache = null;
    this.coursesCache.clear();
  }

  getCourseDetail(courseId: number): Observable<any> {
     return this.http
      .get(`${this.guardianApiUrl}/student-courses/${courseId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
