import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingService {
  private baseUrl = environment.AdminApiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // getSettings(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/settings`, { headers: this.getHeaders() });
  // }
  getSettings(): Observable<any> {
  console.log('URL:', `${this.baseUrl}/settings`);
  return this.http.get(`${this.baseUrl}/settings`, { headers: this.getHeaders() });
}

  saveSettings(payload: FormData): Observable<any> {
    const token = localStorage.getItem('token') || '';
    return this.http.post(`${this.baseUrl}/settings`, payload, {
      headers: new HttpHeaders({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });
  }

  getSeoSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/seo-settings`, { headers: this.getHeaders() });
  }

  saveSeoSettings(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/seo-settings`, payload, { headers: this.getHeaders() });
  }
}