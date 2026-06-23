import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.AdminApiUrl; 

  constructor(private http: HttpClient) {}

  /* =========================
      Headers Helper
     ========================= */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

 
  resetPassword(data: any): Observable<any> {
    console.log(' Admin Service: resetPassword called', data);
    
    return this.http.put(`${this.apiUrl}/reset-password`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log(' Password reset response:', response)),
      catchError(error => {
        console.error(' Password reset error:', error);
        return throwError(() => error);
      })
    );
  }

  
}