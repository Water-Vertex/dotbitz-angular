import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProgramaticSeo {
  id?: number;
  focus_keyword?: string;
  content?: string;
  image?: string;
  image_alt?: string;
  h1_heading?: string;
  faqs?: string;
  section_content_left?: string;
  section_content_right?: string;
  image_left?: string;
  image_right?: string;
  image_left_alt?: string;
  image_right_alt?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramaticSeoService {
  private apiUrl = `${environment.AdminApiUrl}/programatic-seo`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: Partial<ProgramaticSeo>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  importCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('csv_file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
}