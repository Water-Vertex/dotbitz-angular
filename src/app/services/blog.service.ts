import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Blog {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  meta_description: string | null;
  meta_title: string | null;
  meta_keywords: string | null;
  meta_tags: string | null;
  page_schemas: any | null;
  created_at: string;
  updated_at: string;
}

export interface BlogResponse {
  success: boolean;
  message?: string;
  data: Blog;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.AdminApiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  getBlogs(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  getBlog(id: number): Observable<BlogResponse> {
    return this.http.get<BlogResponse>(`${this.apiUrl}/${id}`);
  }

  // For form data with file upload (create)
  createBlogWithFile(formData: FormData): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(this.apiUrl, formData);
  }

  // For JSON data (create without file)
  createBlog(data: any): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(this.apiUrl, data);
  }

  // For form data with file upload (update)
  updateBlogWithFile(id: number, formData: FormData): Observable<BlogResponse> {
    return this.http.post<BlogResponse>(`${this.apiUrl}/${id}?_method=PUT`, formData);
  }

  // For JSON data (update without file)
  updateBlog(id: number, data: any): Observable<BlogResponse> {
    return this.http.put<BlogResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteBlog(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
