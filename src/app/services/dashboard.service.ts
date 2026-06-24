import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardStats, DashboardResponse } from '../models/dashboard.model';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private AdminApiUrl = environment.AdminApiUrl + '/dashboard';
  private StudentApiUrl = environment.StudentApiUrl + '/dashboard';
  private GuardianApiUrl = environment.GuardianApiUrl + '/dashboard';
  private InstructorApiUrl = environment.InstructorApiUrl + '/dashboard';

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics for Admin
   */
  getAdminStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.AdminApiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get dashboard statistics for Student
   */
  getStudentStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.StudentApiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get dashboard statistics for Guardian
   */
  getGuardianStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.GuardianApiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get dashboard statistics for Instructor
   */
  getInstructorStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.InstructorApiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Generic method to get stats for any role
   * @param role - The role type (admin, student, guardian, instructor)
   */
  getStatsByRole(role: 'admin' | 'student' | 'guardian' | 'instructor'): Observable<DashboardResponse> {
    switch(role) {
      case 'admin':
        return this.getAdminStats();
      case 'student':
        return this.getStudentStats();
      case 'guardian':
        return this.getGuardianStats();
      case 'instructor':
        return this.getInstructorStats();
      default:
        return throwError(() => new Error('Invalid role specified'));
    }
  }

  /**
   * Error handler for HTTP requests
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred while fetching dashboard statistics';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
