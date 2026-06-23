import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private AdminApiUrl = environment.AdminApiUrl;
    private GuardianApiUrl = environment.GuardianApiUrl;
    private StudentApiUrl = environment.StudentApiUrl;
    private InstructorApiUrl = environment.InstructorApiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();
    private isInitialized = false;

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.initialize();
    }

    private initialize(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.loadUserFromStorage();
            this.isInitialized = true;
        }
    }

    // ✅ UPDATED: roles aur permissions bhi store ho rahe hain
    private storeAuth(token: string, userData: any, roles: string[] = [], permissions: string[] = []) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('roles', JSON.stringify(roles));
            localStorage.setItem('permissions', JSON.stringify(permissions));
            this.currentUserSubject.next(userData);
        }
    }

    // ✅ UPDATED: roles aur permissions pass kiye ja rahe hain
    login(credentials: LoginRequest) {
        return this.http.post<any>(`${this.AdminApiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res?.success && res?.token && res?.user) {
                    this.storeAuth(res.token, res.user, res.roles || [], res.permissions || []);
                }
            })
        );
    }

    guardianLogin(credentials: LoginRequest) {
        return this.http.post<any>(`${this.GuardianApiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res?.success && res?.token && res?.guardian) {
                    this.storeAuth(res.token, res.guardian);
                }
            })
        );
    }

    studentLogin(credentials: LoginRequest) {
        return this.http.post<any>(`${this.StudentApiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res?.success && res?.token && res?.student) {
                    this.storeAuth(res.token, res.student);
                }
            })
        );
    }

    InstructorLogin(credentials: LoginRequest) {
        return this.http.post<any>(`${this.InstructorApiUrl}/login`, credentials).pipe(
            tap(res => {
                if (res?.success && res?.token && res?.instructor) {
                    this.storeAuth(res.token, res.instructor);
                }
            })
        );
    }

    // ========== STUDENT FORGOT PASSWORD ==========
    
    /**
     * Send password reset link to student's email
     * @param data - Object containing email
     * @returns Observable with API response
     */
    studentForgotPassword(data: { email: string }): Observable<any> {
        return this.http.post(`${this.StudentApiUrl}/forgot-password`, data);
    }

    /**
     * Validate student reset token
     * @param data - Object containing token and email
     * @returns Observable with API response
     */
    validateStudentResetToken(data: { token: string; email: string }): Observable<any> {
        return this.http.post(`${this.StudentApiUrl}/validate-token`, data);
    }

    /**
     * Reset student password with token
     * @param data - Object containing token, email, password, and confirmPassword
     * @returns Observable with API response
     */
    // In auth.service.ts

studentResetPassword(data: { 
  email: string; 
  password: string; 
  confirmPassword: string;
  token?: string | null;
}): Observable<any> {
  // Transform to match API expectations
  const payload = {
    email: data.email,
    password: data.password,
    password_confirmation: data.confirmPassword, // Convert to snake_case for API
    token: data.token
  };
  
  // Remove token if it's null or undefined
  if (!payload.token) {
    delete payload.token;
  }
  
  console.log('Sending payload:', payload); // Debug log
  
  return this.http.post(`${this.StudentApiUrl}/reset-password`, payload);
}

    // ========== GUARDIAN FORGOT PASSWORD ==========
    
    /**
     * Send password reset link to guardian's email
     * @param data - Object containing email
     * @returns Observable with API response
     */
    guardianForgotPassword(data: { email: string }): Observable<any> {
        return this.http.post(`${this.GuardianApiUrl}/forgot-password`, data);
    }

    /**
     * Validate guardian reset token
     * @param data - Object containing token and email
     * @returns Observable with API response
     */
    validateGuardianResetToken(data: { token: string; email: string }): Observable<any> {
        return this.http.post(`${this.GuardianApiUrl}/validate-token`, data);
    }

    /**
     * Reset guardian password with token
     * @param data - Object containing token, email, password, and confirmPassword
     * @returns Observable with API response
     */
    guardianResetPassword(data: { 
        email: string; 
        password: string; 
        confirmPassword: string;
        token?: string | null;
    }): Observable<any> {
        const payload: any = {
            email: data.email,
            password: data.password,
            password_confirmation: data.confirmPassword
        };
        
        if (data.token) {
            payload.token = data.token;
        }
        
        return this.http.post(`${this.GuardianApiUrl}/reset-password`, payload);
    }

    // ========== INSTRUCTOR FORGOT PASSWORD ==========
    
    /**
     * Send password reset link to instructor's email
     * @param data - Object containing email
     * @returns Observable with API response
     */
    instructorForgotPassword(data: { email: string }): Observable<any> {
        return this.http.post(`${this.InstructorApiUrl}/forgot-password`, data);
    }

    /**
     * Validate instructor reset token
     * @param data - Object containing token and email
     * @returns Observable with API response
     */
    validateInstructorResetToken(data: { token: string; email: string }): Observable<any> {
        return this.http.post(`${this.InstructorApiUrl}/validate-token`, data);
    }

    /**
     * Reset instructor password with token
     * @param data - Object containing token, email, password, and confirmPassword
     * @returns Observable with API response
     */
    instructorResetPassword(data: { 
        email: string; 
        password: string; 
        confirmPassword: string;
        token?: string | null;
    }): Observable<any> {
        const payload: any = {
            email: data.email,
            password: data.password,
            password_confirmation: data.confirmPassword
        };
        
        if (data.token) {
            payload.token = data.token;
        }
        
        return this.http.post(`${this.InstructorApiUrl}/reset-password`, payload);
    }

    // ========== ADMIN FORGOT PASSWORD ==========
    
    /**
     * Send password reset link to admin's email
     * @param data - Object containing email
     * @returns Observable with API response
     */
    adminForgotPassword(data: { email: string }): Observable<any> {
        return this.http.post(`${this.AdminApiUrl}/forgot-password`, data);
    }

    /**
     * Validate admin reset token
     * @param data - Object containing token and email
     * @returns Observable with API response
     */
    validateAdminResetToken(data: { token: string; email: string }): Observable<any> {
        return this.http.post(`${this.AdminApiUrl}/validate-token`, data);
    }

    /**
     * Reset admin password with token
     * @param data - Object containing token, email, password, and confirmPassword
     * @returns Observable with API response
     */
    adminResetPassword(data: { 
        email: string; 
        password: string; 
        confirmPassword: string;
        token?: string | null;
    }): Observable<any> {
        const payload: any = {
            email: data.email,
            password: data.password,
            password_confirmation: data.confirmPassword
        };
        
        if (data.token) {
            payload.token = data.token;
        }
        
        return this.http.post(`${this.AdminApiUrl}/reset-password`, payload);
    }

    // ========== ROLES & PERMISSIONS METHODS ==========
    
    getRoles(): string[] {
        if (isPlatformBrowser(this.platformId)) {
            return JSON.parse(localStorage.getItem('roles') || '[]');
        }
        return [];
    }

    getPermissions(): string[] {
        if (isPlatformBrowser(this.platformId)) {
            return JSON.parse(localStorage.getItem('permissions') || '[]');
        }
        return [];
    }

    hasPermission(permission: string): boolean {
        return this.getPermissions().includes(permission);
    }

    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    // ========== LOGOUT METHODS ==========

    logout(): Observable<any> {
        const token = this.getToken();
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this.AdminApiUrl}/logout`, {}, { headers }).pipe(
            tap({
                next: () => { this.clearAuthData(); this.router.navigate(['/login']); },
                error: () => { this.clearAuthData(); this.router.navigate(['/login']); }
            })
        );
    }

    GuardianLogout(): Observable<any> {
        const token = this.getToken();
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this.GuardianApiUrl}/logout`, {}, { headers }).pipe(
            tap({
                next: () => { this.clearAuthData(); this.router.navigate(['/guardian/login']); },
                error: () => { this.clearAuthData(); this.router.navigate(['/guardian/login']); }
            })
        );
    }

    Studentlogout(): Observable<any> {
        const token = this.getToken();
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this.StudentApiUrl}/logout`, {}, { headers }).pipe(
            tap({
                next: () => { this.clearAuthData(); this.router.navigate(['/student/login']); },
                error: () => { this.clearAuthData(); this.router.navigate(['/student/login']); }
            })
        );
    }

    Instructorlogout(): Observable<any> {
        const token = this.getToken();
        let headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.post(`${this.InstructorApiUrl}/logout`, {}, { headers }).pipe(
            tap({
                next: () => { this.clearAuthData(); this.router.navigate(['/instructor/login']); },
                error: () => { this.clearAuthData(); this.router.navigate(['/instructor/login']); }
            })
        );
    }

    // ========== HELPER METHODS ==========

    isLoggedIn(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!this.getToken();
        }
        return false;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    waitForInitialization(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.isInitialized) {
                resolve(this.isLoggedIn());
            } else {
                const interval = setInterval(() => {
                    if (this.isInitialized) {
                        clearInterval(interval);
                        resolve(this.isLoggedIn());
                    }
                }, 100);
            }
        });
    }

    clearAuthData(): void {
        this.clearStorage();
        this.currentUserSubject.next(null);
    }

    public getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token');
        }
        return null;
    }

    private getUser(): User | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined' || userStr === 'null') {
            return null;
        }
        try {
            return JSON.parse(userStr);
        } catch (error) {
            localStorage.removeItem('user');
            return null;
        }
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

    // ✅ UPDATED: roles aur permissions bhi clear ho rahe hain
    private clearStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('roles');
            localStorage.removeItem('permissions');
        }
    }
}