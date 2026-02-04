import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router'; // Add Router
import { LoginRequest, LoginResponse, AuthResponse, User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private isInitialized = false;

  constructor(
    private http: HttpClient,
    private router: Router, // Inject Router
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize immediately
    this.initialize();
  }

  private initialize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
      this.isInitialized = true;
    }
  }

 login(credentials: LoginRequest) {
  return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
    tap(res => {
      if (res.success) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      }
    })
  );
}

  logout(): Observable<any> {
    const token = this.getToken();

    // Prepare headers
    let headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap({
        next: (response: any) => {
          console.log('Logout successful:', response);
          this.clearAuthData();
          this.router.navigate(['/login']); // Redirect after successful logout
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Even if API call fails, clear local data
          this.clearAuthData();
          this.router.navigate(['/login']);
        },
        complete: () => {
          // Fallback - ensure data is cleared
          this.clearAuthData();
        }
      })
    );
  }

  // Clear auth data and redirect
  clearAuthData(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);

    // Navigate to login page
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!this.getToken();
    }
    return false;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Wait for initialization
  waitForInitialization(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(this.isLoggedIn());
      } else {
        // Check every 100ms until initialized
        const interval = setInterval(() => {
          if (this.isInitialized) {
            clearInterval(interval);
            resolve(this.isLoggedIn());
          }
        }, 100);
      }
    });
  }

  // Token management
  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  private getUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const user = this.getUser();
    if (token && user) {
      this.currentUserSubject.next(user);
    } else {
      this.currentUserSubject.next(null);
    }
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}
