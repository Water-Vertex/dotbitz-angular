// src/app/services/sitemap.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SitemapService {

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getSitemapData(): Observable<any> {
    return this.http.get(
      `${environment.AdminApiUrl}/sitemap`,
      { headers: this.getHeaders() }
    );
  }

  getDownloadUrl(): string {
    return `${environment.AdminApiUrl}/sitemap/download`;
  }
}
