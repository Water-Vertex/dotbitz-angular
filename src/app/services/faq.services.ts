import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = 'http://localhost:8000/api/faqs';

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
getFAQ(id: number): Observable<any> {
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

  // Create new FAQ
  createFAQ(data: any): Observable<any> {
    console.log('Creating FAQ:', data);
    return this.http.post<any>(this.apiUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating FAQ:', error);
        return throwError(() => error);
      })
    );
  }

  // Update FAQ
  updateFAQ(id: number, data: any): Observable<any> {
    console.log(`Updating FAQ ${id}:`, data);
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error updating FAQ ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Delete FAQ
  deleteFAQ(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Get all FAQs
  getFAQs(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }
}