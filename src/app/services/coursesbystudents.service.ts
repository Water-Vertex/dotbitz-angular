import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs'; // 'of' add kiya caching ke liye
import { catchError, tap } from 'rxjs/operators'; // 'tap' add kiya data save karne ke liye

@Injectable({
  providedIn: 'root',
})
export class CoursesByStudentsService {
  private GuardianApiUrl = 'http://localhost:8000/api/guardian';

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

  /**
   * Fetch all students (With Caching for fast loading)
   */
  getGuardianStudents(): Observable<any> {
    // Agar data pehle se hai, to foran return kar dein
    if (this.studentsCache) {
      return of(this.studentsCache);
    }

    return this.http.get(`${this.GuardianApiUrl}/students`, { headers: this.getHeaders() }).pipe(
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
      .get(`${this.GuardianApiUrl}/student-courses/${studentId}`, { headers: this.getHeaders() })
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
      .get(`${this.GuardianApiUrl}/student-courses/${courseId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
