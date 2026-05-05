import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = environment.AdminApiUrl + '/pre-registrations';

  constructor(private http: HttpClient) {}

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

  // Get single FAQ - handle different response structures
  // In FaqService - update the getFAQ method
getRegistration(id: number): Observable<any> {
  console.log(`Fetching FAQ ${id} from ${this.apiUrl}/${id}`);

  return this.http.get<any>(`${this.apiUrl}/${id}`, {
    headers: this.getHeaders()
  }).pipe(
    map(response => {
      console.log('Raw FAQ response:', response);

      // Handle both response structures
      if (response.success !== undefined) {
        // Format 1: { success: true, data: {...}, message: '...' }
        return response;
      } else if (response.id) {
        // Format 2: Direct FAQ object { id: 1, question: '...', ... }
        return {
          success: true,
          data: response,
          message: 'FAQ retrieved successfully'
        };
      } else if (response.data) {
        // Format 3: { data: {...} }
        return { success: true, ...response };
      } else {
        console.error('Unexpected FAQ response structure:', response);
        throw new Error('Invalid FAQ response structure');
      }
    }),
    catchError(error => {
      console.error(`Error fetching FAQ ${id}:`, error);
      return throwError(() => error);
    })
  );
}


  // Get all FAQs
  getRegistrations(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }
}
