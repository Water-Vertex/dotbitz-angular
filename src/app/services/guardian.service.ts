import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuardianService {
  private GuardianApiUrl = 'http://localhost:8000/api/guardian';

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
}
