import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.StudentApiUrl; // http://localhost:8000/api/student
  private guardianApiUrl = environment.GuardianApiUrl; // http://localhost:8000/api/guardian

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

//   validateCoupon(couponCode: string): Observable<any> {
//     return this.http
//       .post(`${this.apiUrl}/coupon/validate`, { coupon_code: couponCode }, { headers: this.getHeaders() })
//       .pipe(catchError((err) => throwError(() => err)));
//   }

validateCoupon(couponCode: string): Observable<any> {
  console.log('Coupon URL:', `${this.apiUrl}/coupon/validate`);
  console.log('Token:', localStorage.getItem('token'));
  return this.http
    .post(`${this.apiUrl}/coupon/validate`, { coupon_code: couponCode }, { headers: this.getHeaders() })
    .pipe(catchError((err) => throwError(() => err)));
}
  placeOrder(payload: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/orders`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

   placeGuardianOrder(payload: any): Observable<any> {
    return this.http.post(`${this.guardianApiUrl}/orders`, payload, { headers: this.getHeaders() });
  }

  getMyOrders(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/orders`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getOrder(id: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/orders/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

   getBatchesByCourse(courseId: number): Observable<any> {
  return this.http.get(
    `${environment.StudentApiUrl}/courses/${courseId}/batches`,
    { headers: this.getHeaders() }
  );
}

getSchedulesByBatch(batchId: number): Observable<any> {
  return this.http.get(
    `${environment.StudentApiUrl}/class-schedules/batch/${batchId}`,
    { headers: this.getHeaders() }
  );
}
 getGuardianBatchesByCourse(courseId: number): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/courses/${courseId}/batches`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // Guardian - Get Schedule by Batch
  getGuardianScheduleByBatch(batchId: number): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/batches/${batchId}/schedule`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
