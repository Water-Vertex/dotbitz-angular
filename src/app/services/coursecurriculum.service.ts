// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';

// import {
//   CourseCurriculumPayload,
//   CourseCurriculumApiResponse,
// } from '../models/coursecurriculum.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class CourseCurriculumService {
//   private apiUrl = 'http://localhost:8000/api/course-curricula';

//   constructor(private http: HttpClient) {}

//   private getHeaders(isFormData: boolean = false): HttpHeaders {
//     const token = localStorage.getItem('token');

//     let headers = new HttpHeaders({
//       Accept: 'application/json',
//     });

//     // Only add application/json if we are NOT sending a file
//     if (!isFormData) {
//       headers = headers.set('Content-Type', 'application/json');
//     }

//     if (token) {
//       headers = headers.set('Authorization', `Bearer ${token}`);
//     }

//     return headers;
//   }

//   /* =========================
//       Get All Curriculums
//      ========================= */
//   getCurriculums(courseId?: number): Observable<CourseCurriculumApiResponse> {
//     let url = this.apiUrl;
//     if (courseId) {
//       url += `?course_id=${courseId}`;
//     }
//     return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
//       catchError((error) => {
//         console.error('Error fetching curriculums:', error);
//         return throwError(() => error);
//       }),
//     );
//   }

//   /* =========================
//       Get Single Curriculum
//      ========================= */
//   getCurriculum(id: number): Observable<CourseCurriculumApiResponse> {
//     return this.http
//       .get<any>(`${this.apiUrl}/${id}`, {
//         headers: this.getHeaders(),
//       })
//       .pipe(
//         map((response) => {
//           if (response.success !== undefined) return response;
//           return { success: true, data: response, message: 'Success' };
//         }),
//         catchError((error) => {
//           console.error(`Error fetching curriculum ${id}:`, error);
//           return throwError(() => error);
//         }),
//       );
//   }

//   /* =========================
//       Create Curriculum (Fixed for FormData)
//      ========================= */
//   createCurriculum(
//     payload: CourseCurriculumPayload | FormData,
//   ): Observable<CourseCurriculumApiResponse> {
//     const isFormData = payload instanceof FormData;

//     return this.http
//       .post<any>(this.apiUrl, payload, {
//         headers: this.getHeaders(isFormData),
//       })
//       .pipe(
//         catchError((error) => {
//           console.error('Error creating curriculum:', error);
//           return throwError(() => error);
//         }),
//       );
//   }

//   /* =========================
//       Update Curriculum (Fixed for FormData)
//      ========================= */
//   updateCurriculum(
//     id: number,
//     payload: CourseCurriculumPayload | FormData,
//   ): Observable<CourseCurriculumApiResponse> {
//     const isFormData = payload instanceof FormData;

//     // NOTE: Some PHP/Laravel backends require POST with '_method: PUT'
//     // when sending FormData via PUT. If this fails, let me know.
//     return this.http
//       .put<any>(`${this.apiUrl}/${id}`, payload, {
//         headers: this.getHeaders(isFormData),
//       })
//       .pipe(
//         catchError((error) => {
//           console.error(`Error updating curriculum ${id}:`, error);
//           return throwError(() => error);
//         }),
//       );
//   }

//   /* =========================
//       Delete Curriculum
//      ========================= */
//   deleteCurriculum(id: number): Observable<any> {
//     return this.http
//       .delete<any>(`${this.apiUrl}/${id}`, {
//         headers: this.getHeaders(),
//       })
//       .pipe(
//         catchError((error) => {
//           console.error(`Error deleting curriculum ${id}:`, error);
//           return throwError(() => error);
//         }),
//       );
//   }

//   /* =========================
//       Get Courses
//      ========================= */
//   getCourses(): Observable<any> {
//     return this.http
//       .get<any>('http://localhost:8000/api/courses', {
//         headers: this.getHeaders(),
//       })
//       .pipe(
//         catchError((error) => {
//           console.error('Error fetching courses:', error);
//           return throwError(() => error);
//         }),
//       );
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CourseCurriculumPayload,
  CourseCurriculumApiResponse,
} from '../models/coursecurriculum.model';

@Injectable({
  providedIn: 'root',
})
export class CourseCurriculumService {
  private apiUrl = 'https://dotbitz.com/api/course-curriculam';
  private coursesUrl = 'https://dotbitz.com/api/courses';

  constructor(private http: HttpClient) {}

  /** Headers helper */
  private getHeaders(isFormData: boolean = false): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ Accept: 'application/json' });

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /** Get all curriculums, optional course filter */
  getCurriculums(courseId?: number): Observable<CourseCurriculumApiResponse> {
    let url = this.apiUrl;
    if (courseId) url += `?course_id=${courseId}`;
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching curriculums:', err);
        return throwError(() => err);
      }),
    );
  }

  /** Get single curriculum */
  getCurriculum(id: number): Observable<CourseCurriculumApiResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      map((res) => {
        return res.success !== undefined ? res : { success: true, data: res, message: 'Success' };
      }),
      catchError((err) => {
        console.error(`Error fetching curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Create curriculum (FormData compatible) */
  createCurriculum(
    payload: CourseCurriculumPayload | FormData,
  ): Observable<CourseCurriculumApiResponse> {
    const isFormData = payload instanceof FormData;
    return this.http.post<any>(this.apiUrl, payload, { headers: this.getHeaders(isFormData) }).pipe(
      catchError((err) => {
        console.error('Error creating curriculum:', err);
        return throwError(() => err);
      }),
    );
  }

  /** Update curriculum (FormData compatible) */
  updateCurriculum(
    id: number,
    payload: CourseCurriculumPayload | FormData,
  ): Observable<CourseCurriculumApiResponse> {
    const isFormData = payload instanceof FormData;

    // If FormData (for file upload), use POST with _method=PUT
    if (isFormData) {
      payload.append('_method', 'PUT');
      return this.http
        .post<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders(true) })
        .pipe(
          catchError((err) => {
            console.error(`Error updating curriculum ${id}:`, err);
            return throwError(() => err);
          }),
        );
    }

    // Otherwise, normal PUT for JSON
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`Error updating curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Delete curriculum */
  deleteCurriculum(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error(`Error deleting curriculum ${id}:`, err);
        return throwError(() => err);
      }),
    );
  }

  /** Get all courses */
  getCourses(): Observable<any> {
    return this.http.get<any>(this.coursesUrl, { headers: this.getHeaders() }).pipe(
      catchError((err) => {
        console.error('Error fetching courses:', err);
        return throwError(() => err);
      }),
    );
  }
}
