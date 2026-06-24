import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    
    const requiredPermission = route.data?.['permission'];
    
    if (!requiredPermission) {
        return true;
    }
    
    if (authService.hasPermission(requiredPermission)) {
        return true;
    }
    
    router.navigate(['/admin/dashboard']);
    return false;
};