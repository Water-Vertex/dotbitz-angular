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

  // ============================================
  // Coupon Methods
  // ============================================

  /**
   * Validate coupon code for student
   */
  validateCoupon(couponCode: string): Observable<any> {
    console.log('Coupon URL:', `${this.apiUrl}/coupon/validate`);
    console.log('Token:', localStorage.getItem('token'));
    return this.http
      .post(`${this.apiUrl}/coupon/validate`, { coupon_code: couponCode }, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Validate coupon code for guardian
   */
  validateGuardianCoupon(couponCode: string): Observable<any> {
    return this.http
      .post(`${this.guardianApiUrl}/coupon/validate`, { coupon_code: couponCode }, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ============================================
  // Order Methods
  // ============================================

  /**
   * Place order for student (self purchase)
   */
  placeOrder(payload: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/orders`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Place order for guardian (parent purchasing for student)
   */
  placeGuardianOrder(payload: any): Observable<any> {
    return this.http.post(`${this.guardianApiUrl}/orders`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get all orders for student
   */
  getMyOrders(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/orders`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get specific order by ID for student
   */
  getOrder(id: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/orders/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get all orders for guardian
   */
  getGuardianOrders(): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/orders`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get specific order by ID for guardian
   */
  getGuardianOrder(id: number): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/orders/${id}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Cancel pending order for student
   */
  cancelOrder(orderId: number): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/orders/${orderId}/cancel`, {}, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Cancel pending order for guardian
   */
  cancelGuardianOrder(orderId: number): Observable<any> {
    return this.http
      .post(`${this.guardianApiUrl}/orders/${orderId}/cancel`, {}, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ============================================
  // Batch & Schedule Methods
  // ============================================

  /**
   * Get batches by course for student
   */
  getBatchesByCourse(courseId: number): Observable<any> {
    return this.http.get(
      `${environment.StudentApiUrl}/courses/${courseId}/batches`,
      { headers: this.getHeaders() }
    ).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get schedules by batch for student
   */
  getSchedulesByBatch(batchId: number): Observable<any> {
    return this.http.get(
      `${environment.StudentApiUrl}/class-schedules/batch/${batchId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get batches by course for guardian
   */
  getGuardianBatchesByCourse(courseId: number): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/courses/${courseId}/batches`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get schedules by batch for guardian
   */
  getGuardianScheduleByBatch(batchId: number): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/batches/${batchId}/schedule`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get enrolled count for batch
   */
  getBatchEnrolledCount(batchId: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/batches/${batchId}/enrolled-count`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ============================================
  // Stripe Payment Methods
  // ============================================

  /**
   * Create Stripe payment intent for an order
   */
  createPaymentIntent(orderId: number): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/orders/create-payment-intent`, { order_id: orderId }, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Create Stripe payment intent for guardian order
   */
  createGuardianPaymentIntent(orderId: number): Observable<any> {
    return this.http
      .post(`${this.guardianApiUrl}/orders/create-payment-intent`, { order_id: orderId }, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Verify payment after Stripe redirect
   */
  verifyPayment(sessionId: string, orderId: number): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/orders/verify-payment`, {
        session_id: sessionId,
        order_id: orderId
      }, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Verify payment for guardian after Stripe redirect
   */
  verifyGuardianPayment(sessionId: string, orderId: number): Observable<any> {
    return this.http
      .post(`${this.guardianApiUrl}/orders/verify-payment`, {
        session_id: sessionId,
        order_id: orderId
      }, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get payment status for an order
   */
  getPaymentStatus(orderId: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/orders/${orderId}/payment-status`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get payment status for guardian order
   */
  getGuardianPaymentStatus(orderId: number): Observable<any> {
    return this.http
      .get(`${this.guardianApiUrl}/orders/${orderId}/payment-status`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Refund an order (admin/staff only)
   */
  refundOrder(orderId: number, amount?: number, reason?: string): Observable<any> {
    const payload: any = {};
    if (amount) payload.amount = amount;
    if (reason) payload.reason = reason;

    return this.http
      .post(`${this.apiUrl}/orders/${orderId}/refund`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Refund a guardian order (admin/staff only)
   */
  refundGuardianOrder(orderId: number, amount?: number, reason?: string): Observable<any> {
    const payload: any = {};
    if (amount) payload.amount = amount;
    if (reason) payload.reason = reason;

    return this.http
      .post(`${this.guardianApiUrl}/orders/${orderId}/refund`, payload, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Get order invoice (PDF)
   */
  getOrderInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/orders/${orderId}/invoice`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Get guardian order invoice (PDF)
   */
  getGuardianOrderInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.guardianApiUrl}/orders/${orderId}/invoice`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(catchError((err) => throwError(() => err)));
  }

  /**
   * Download invoice
   */
  downloadInvoice(orderId: number, type: 'student' | 'guardian' = 'student'): void {
    const observable = type === 'student'
      ? this.getOrderInvoice(orderId)
      : this.getGuardianOrderInvoice(orderId);

    observable.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download invoice:', err);
        alert('Failed to download invoice. Please try again.');
      }
    });
  }

// Admin - All bills
getAdminBills(status?: string, search?: string): Observable<any> {
  let url = `${environment.AdminApiUrl}/bills`;
  const params: string[] = [];

  if (status) params.push(`status=${status}`);
  if (search) params.push(`search=${search}`);
  if (params.length) url += `?${params.join('&')}`;

  return this.http.get(url, { headers: this.getHeaders() });
}

// Admin - Bill detail
getAdminBillDetail(orderId: number): Observable<any> {
  return this.http.get(
    `${environment.AdminApiUrl}/bills/${orderId}`,
    { headers: this.getHeaders() }
  );
}

// Student - My bills
getStudentBills(): Observable<any> {
  return this.http.get(
    `${this.apiUrl}/my-bills`,
    { headers: this.getHeaders() }
  );
}

// Guardian - My bills
getGuardianBills(): Observable<any> {
  return this.http.get(
    `${this.guardianApiUrl}/my-bills`,
    { headers: this.getHeaders() }
  );
}
}
