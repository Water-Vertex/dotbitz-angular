import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Instructor, Course, CourseApiResponse } from '../models/course.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  // private apiUrl = 'http://localhost:8000/api/courses';

  private apiUrl = environment.AdminApiUrl + '/courses';
  private StudentApiUrl = environment.StudentApiUrl + '/my-courses';
  private guardianApiUrl = environment.GuardianApiUrl + '/courses';
  private instructorApiUrl = environment.InstructorApiUrl + '/courses';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // File upload ke liye special headers (No Content-Type)
  private getFileHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getInstructors(): Observable<{ data: Instructor[] }> {
    return this.http.get<{ data: Instructor[] }>(`${this.apiUrl}/instructors`, {
      headers: this.getHeaders(),
    });
  }

  getCourses(search: string = '', perPage: number = 10): Observable<CourseApiResponse> {
    let url = `${this.apiUrl}?per_page=${perPage}`;
    if (search) url += `&search=${search}`;
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }


  getCourse(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createCourse(payload: FormData): Observable<CourseApiResponse> {
    return this.http
      .post<CourseApiResponse>(this.apiUrl, payload, { headers: this.getFileHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // --- MODIFIED FOR EDIT WITH IMAGE ---
  updateCourse(id: number, payload: FormData | Course): Observable<CourseApiResponse> {
    // Agar payload FormData hai (image upload ke liye),
    // to hum POST use karenge Method Spoofing ke saath
    if (payload instanceof FormData) {
      return this.http
        .post<CourseApiResponse>(`${this.apiUrl}/${id}`, payload, {
          headers: this.getFileHeaders(),
        })
        .pipe(catchError((err) => throwError(() => err)));
    }

    // Normal PUT request agar sirf JSON data hai
    return this.http
      .put<CourseApiResponse>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteCourse(id: number): Observable<CourseApiResponse> {
    return this.http
      .delete<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

   getStudentCourses(search: string = '', perPage: number = 50): Observable<CourseApiResponse> {
    let url = `${this.StudentApiUrl}?per_page=${perPage}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Fetches a single course detail for the Student.
   */

  getCourseDetail(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
  getStudentCourseDetail(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.StudentApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getGuardianCourses(search: string = '', perPage: number = 50): Observable<CourseApiResponse> {
    let url = `${this.guardianApiUrl}?per_page=${perPage}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Fetches a single course detail for the Guardian.
   */
  getGuardianCourseDetail(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.guardianApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

   getInstructorCourses(search: string = '', perPage: number = 50): Observable<CourseApiResponse> {
    let url = `${this.instructorApiUrl}?per_page=${perPage}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http
      .get<CourseApiResponse>(url, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Fetches a single course detail for the Instructor.
   */
  getInstructorCourseDetail(id: number): Observable<CourseApiResponse> {
    return this.http
      .get<CourseApiResponse>(`${this.instructorApiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
  getQuizzesByBatch(batchId: number): Observable<any> {
  return this.http.get(
    `${environment.StudentApiUrl}/quizzes/batch/${batchId}`,
    { headers: this.getHeaders() }
  );
}

checkQuizAttempt(quizId: number): Observable<any> {
  return this.http.get(
    `${environment.StudentApiUrl}/quiz-attempts/check/${quizId}`,
    { headers: this.getHeaders() }
  );
}

startQuiz(quizId: number): Observable<any> {
  return this.http.post(
    `${environment.StudentApiUrl}/quiz-attempts/start/${quizId}`,
    {},
    { headers: this.getHeaders() }
  );
}

submitQuiz(attemptId: number, payload: any): Observable<any> {
  return this.http.post(
    `${environment.StudentApiUrl}/quiz-attempts/submit/${attemptId}`,
    payload,
    { headers: this.getHeaders() }
  );
}

}