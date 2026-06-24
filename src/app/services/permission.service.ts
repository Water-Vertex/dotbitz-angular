import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';  // ✅ ADD THIS IMPORT
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private apiUrl = `${environment.AdminApiUrl}`;

    constructor(private http: HttpClient, private auth: AuthService) {}

    private headers(): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${this.auth.getToken()}`,
            'Content-Type': 'application/json',
        });
    }

    getRoles(): Observable<any> {
        console.log('🔵 Calling API: GET /roles');  // ✅ ADD
        return this.http.get(`${this.apiUrl}/roles`, { headers: this.headers() }).pipe(
            tap(res => console.log('✅ Roles API Response:', res))  // ✅ ADD
        );
    }

    getAllPermissions(): Observable<any> {
        console.log('🔵 Calling API: GET /permissions');  // ✅ ADD
        return this.http.get(`${this.apiUrl}/permissions`, { headers: this.headers() }).pipe(
            tap(res => console.log('✅ Permissions API Response:', res))  // ✅ ADD
        );
    }

    updateRolePermissions(roleId: number, permissions: string[]): Observable<any> {
        console.log('🔵 Calling API: POST /roles/${roleId}/permissions', permissions);  // ✅ ADD
        return this.http.post(`${this.apiUrl}/roles/${roleId}/permissions`, 
            { permissions }, 
            { headers: this.headers() }
        ).pipe(
            tap(res => console.log('✅ Update Response:', res))  // ✅ ADD
        );
    }

   // permission.service.ts
getUsers(): Observable<any> {
    console.log('🔵 Calling getUsers API');
    return this.http.get(`${this.apiUrl}/users-list`, { headers: this.headers() }).pipe(
        tap(res => console.log('✅ Users Response:', res))
    );
}

    assignRole(userId: number, role: string): Observable<any> {
        console.log(`🔵 Calling API: POST /users/${userId}/assign-role`, { role });  // ✅ ADD
        return this.http.post(`${this.apiUrl}/users/${userId}/assign-role`,
            { role },
            { headers: this.headers() }
        ).pipe(
            tap(res => console.log('✅ Assign Role Response:', res))  // ✅ ADD
        );
    }

    createUser(data: { name: string; email: string; password: string; role: string }): Observable<any> {
        console.log('🔵 Calling API: POST /users/create', data);  // ✅ ADD
        return this.http.post(`${this.apiUrl}/users/create`, data, { headers: this.headers() }).pipe(
            tap(res => console.log('✅ Create User Response:', res))  // ✅ ADD
        );
    }
}