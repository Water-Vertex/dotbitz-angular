import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AssignAssessmentService {
  private apiUrl = environment.AdminApiUrl + '/assign-assessments';
  private studentApiUrl = environment.StudentApiUrl + '/my-assessments';
  private guardianApiUrl = environment.GuardianApiUrl + '/assessments';
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Renamed to getAssignAssessments
  getAssignAssessments(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching assessments:', error);
        return throwError(() => error);
      }),
    );
  }

  // Renamed to getAssignAssessment
  getAssignAssessment(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map((response) => {
        if (response.success !== undefined) return response;
        if (response.id)
          return { success: true, data: response, message: 'Assessment retrieved successfully' };
        return { success: true, ...response };
      }),
      catchError((error) => {
        console.error(`Error fetching assessment ${id}:`, error);
        return throwError(() => error);
      }),
    );
  }

  // Renamed to updateAssignAssessment
  updateAssignAssessment(id: number | string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error(`Error updating assessment ${id}:`, error);
        return throwError(() => error);
      }),
    );
  }

  // Renamed to deleteAssignAssessment
  deleteAssignAssessment(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error(`Error deleting assessment ${id}:`, error);
        return throwError(() => error);
      }),
    );
  }


  

  // --- STUDENT SIDE METHOD ---

  getStudentAssessments(): Observable<any> {
    return this.http.get<any>(this.studentApiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Error fetching student assessments:', error);
        return throwError(() => error);
      }),
    );
  }

 // --- GUARDIAN SIDE METHOD ---
  getGuardianStudentAssessments(studentId?: number): Observable<any> {
    
    const url = studentId ? `${this.guardianApiUrl}?student_id=${studentId}` : this.guardianApiUrl;

    return this.http
      .get<any>(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError('fetching guardian student assessments')));
  }
  private handleError(action: string) {
    return (error: any) => {
      console.error(`Error ${action}:`, error);
      return throwError(() => error);
    };
  }
}