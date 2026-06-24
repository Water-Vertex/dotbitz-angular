import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // HttpHeaders add kiya
import { Observable, throwError } from 'rxjs'; // throwError add kiya
import { catchError } from 'rxjs/operators'; // catchError add kiya
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GuardianService {
  private GuardianApiUrl = environment.GuardianApiUrl;

  constructor(private http: HttpClient) {}

  // 1. getHeaders method define kiya taake baar baar code na likhna pare
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || ''; // Check karein agar 'guardian_token' hai toh wo likhein
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
  }

  // Fetch currently logged-in guardian profile
  getProfile(): Observable<any> {
    return this.http.get(this.GuardianApiUrl, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.GuardianApiUrl}/profile/update`, data, {
      headers: this.getHeaders(),
    });
  }

  getGuardianStudents(): Observable<any> {
    return this.http.get(`${this.GuardianApiUrl}/checkout/guardian`, {
      headers: this.getHeaders(),
    });
  }

  getAllGuardians(): Observable<any> {
    return this.http.get(`${environment.AdminApiUrl}/guardians`, {
      headers: this.getHeaders(),
    });
  }

  // Reset Password with proper Error Handling
  resetPassword(data: { new_password: string; confirm_password: string }): Observable<any> {
    return this.http.post(`${this.GuardianApiUrl}/reset-password`, data, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(err => {
        console.error('Password Reset Error:', err);
        return throwError(() => err);
      })
    );
  }
}