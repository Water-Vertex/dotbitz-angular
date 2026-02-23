import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GuardianService {
  private GuardianApiUrl = environment.GuardianApiUrl;

  constructor(private http: HttpClient) {}

  // Fetch currently logged-in guardian profile
  getProfile(): Observable<any> {
    const token = localStorage.getItem('token'); // or wherever you store it
    return this.http.get(this.GuardianApiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.GuardianApiUrl}/profile/update`, data);
  }

  getGuardianStudents(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.GuardianApiUrl}/checkout/guardian`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
