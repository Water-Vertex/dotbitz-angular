import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  // private apiUrl = 'https://dotbitz.com/api/policies';
  private apiUrl = 'http://localhost:8000/api/policies';

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

  // Get single Policy - handle different response structures
  // In PolicyService - update the getPolicy method
getPolicy(id: number): Observable<any> {
  console.log(`Fetching Policies ${id} from ${this.apiUrl}/${id}`);

  return this.http.get<any>(`${this.apiUrl}/${id}`, {
    headers: this.getHeaders()
  }).pipe(
    map(response => {
      console.log('Raw Policy response:', response);

      // Handle both response structures
      if (response.success !== undefined) {
        // Format 1: { success: true, data: {...}, message: '...' }
        return response;
      } else if (response.id) {
        // Format 2: Direct Policy object { id: 1, question: '...', ... }
        return {
          success: true,
          data: response,
          message: 'Policies retrieved successfully'
        };
      } else if (response.data) {
        // Format 3: { data: {...} }
        return { success: true, ...response };
      } else {
        console.error('Unexpected Policy response structure:', response);
        throw new Error('Invalid Policy response structure');
      }
    }),
    catchError(error => {
      console.error(`Error fetching Policy ${id}:`, error);
      return throwError(() => error);
    })
  );
}

  // Create new Policy
  createPolicy(data: any): Observable<any> {
    console.log('Creating Policy:', data);
    return this.http.post<any>(this.apiUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error creating Policy:', error);
        return throwError(() => error);
      })
    );
  }

  // Update Policy
  updatePolicy(id: number, data: any): Observable<any> {
    console.log(`Updating Policy ${id}:`, data);
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error updating Policy ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  // Delete Policy
  deletePolicy(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Get all Policies
  getPolicies(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }
}
