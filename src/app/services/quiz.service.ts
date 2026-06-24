import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private apiUrl = environment.AdminApiUrl + '/quizzes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // List — with optional course filter
  getQuizzes(courseId?: number, batchId?: number): Observable<any> {
    let url = this.apiUrl;
    if (courseId) url += `?course_id=${courseId}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Single quiz
  getQuiz(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Create
  createQuiz(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  // Update
  updateQuiz(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload, { headers: this.getHeaders() });
  }

  // Delete
  deleteQuiz(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Course k MCQs
  getMcqsByCourse(courseId: number): Observable<any> {
    return this.http.get(
      `${environment.AdminApiUrl}/quizzes/course/${courseId}/mcqs`,
      { headers: this.getHeaders() }
    );
  }

  // Course k Batches
  getBatchesByCourse(courseId: number): Observable<any> {
    return this.http.get(
      `${environment.AdminApiUrl}/batches/course/${courseId}`,
      { headers: this.getHeaders() }
    );
  }
// Instructor Quiz methods
getInstructorQuizzes(): Observable<any> {
  return this.http.get(
    `${environment.InstructorApiUrl}/quizzes`,
    { headers: this.getHeaders() }
  );
}

getInstructorQuiz(id: number): Observable<any> {
  return this.http.get(
    `${environment.InstructorApiUrl}/quizzes/${id}`,
    { headers: this.getHeaders() }
  );
}

createInstructorQuiz(payload: any): Observable<any> {
  return this.http.post(
    `${environment.InstructorApiUrl}/quizzes`,
    payload,
    { headers: this.getHeaders() }
  );
}

updateInstructorQuiz(id: number, payload: any): Observable<any> {
  return this.http.put(
    `${environment.InstructorApiUrl}/quizzes/${id}`,
    payload,
    { headers: this.getHeaders() }
  );
}

deleteInstructorQuiz(id: number): Observable<any> {
  return this.http.delete(
    `${environment.InstructorApiUrl}/quizzes/${id}`,
    { headers: this.getHeaders() }
  );
}

getInstructorMcqsByCourse(courseId: number): Observable<any> {
  return this.http.get(
    `${environment.InstructorApiUrl}/quizzes/course/${courseId}/mcqs`,
    { headers: this.getHeaders() }
  );
}

getInstructorBatchesByCourse(courseId: number): Observable<any> {
  return this.http.get(
    `${environment.InstructorApiUrl}/courses/${courseId}/batches`,
    { headers: this.getHeaders() }
  );
}
getQuizzesByBatch(batchId: number): Observable<any> {
  return this.http.get(
    `${environment.StudentApiUrl}/quizzes/batch/${batchId}`,
    { headers: this.getHeaders() }
  );
}

// Admin methods
getAttemptedList(courseId?: number, quizId?: number): Observable<any> {
  let url = `${environment.AdminApiUrl}/quiz-attempts`;
  const params: string[] = [];
  if (courseId) params.push(`course_id=${courseId}`);
  if (quizId) params.push(`quiz_id=${quizId}`);
  if (params.length) url += `?${params.join('&')}`;
  return this.http.get(url, { headers: this.getHeaders() });
}

getAttemptDetail(attemptId: number): Observable<any> {
  return this.http.get(
    `${environment.AdminApiUrl}/quiz-attempts/${attemptId}`,
    { headers: this.getHeaders() }
  );
}

checkQuiz(attemptId: number, payload: any): Observable<any> {
  return this.http.post(
    `${environment.AdminApiUrl}/quiz-attempts/${attemptId}/check`,
    payload,
    { headers: this.getHeaders() }
  );
}

// Instructor methods
getInstructorAttemptedList(courseId?: number, quizId?: number): Observable<any> {
  let url = `${environment.InstructorApiUrl}/quiz-attempts`;
  const params: string[] = [];
  if (courseId) params.push(`course_id=${courseId}`);
  if (quizId) params.push(`quiz_id=${quizId}`);
  if (params.length) url += `?${params.join('&')}`;
  return this.http.get(url, { headers: this.getHeaders() });
}

getInstructorAttemptDetail(attemptId: number): Observable<any> {
  return this.http.get(
    `${environment.InstructorApiUrl}/quiz-attempts/${attemptId}`,
    { headers: this.getHeaders() }
  );
}

checkInstructorQuiz(attemptId: number, payload: any): Observable<any> {
  return this.http.post(
    `${environment.InstructorApiUrl}/quiz-attempts/${attemptId}/check`,
    payload,
    { headers: this.getHeaders() }
  );
}

getQuizBatchStatus(payload: any): Observable<any> {
  return this.http.post(
    `${environment.AdminApiUrl}/quiz-attempts/batch-status`,
    payload,
    { headers: this.getHeaders() }
  );
}

getInstructorQuizBatchStatus(payload: any): Observable<any> {
  return this.http.post(
    `${environment.InstructorApiUrl}/quiz-attempts/batch-status`,
    payload,
    { headers: this.getHeaders() }
  );
}
getInstructorCourses(): Observable<any> {
  return this.http.get(
    `${environment.InstructorApiUrl}/courses`,
    { headers: this.getHeaders() }
  );
}

}
