import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private guardianApiUrl = environment.GuardianApiUrl;
  private orderUrl = this.guardianApiUrl + '/orders';
  private couponUrl = this.guardianApiUrl + '/validate-coupon';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  }

  // ✅ Validate Coupon
  validateCoupon(couponCode: string): Observable<any> {
    return this.http.post(
      this.couponUrl,
      { coupon_code: couponCode },
      { headers: this.getHeaders() },
    );
  }

  // ✅ Place Order
  placeOrder(payload: any): Observable<any> {
    return this.http.post(this.orderUrl, payload, { headers: this.getHeaders() });
  }
}
