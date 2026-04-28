import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../../services/permission.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
    selector: 'app-roles-permissions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './roles-permissions.html',
    styleUrls: ['./roles-permissions.css']
})
export class RolesPermissionsComponent implements OnInit {
    roles: any[] = [];
    allPermissions: string[] = [];
    users: any[] = [];
    selectedRole: any = null;
    loading = false;
    saveLoading = false;
    showCreateForm = false;
    activeTab: 'permissions' | 'users' = 'permissions';
    expandedModule: string | null = null;

    newUser = { name: '', email: '', password: '', role: '' };
    permissionGroups: { [key: string]: string[] } = {};

    private modules = [
        'students', 'instructors', 'guardians', 'courses', 'batches',
        'assignments', 'assessments', 'quizzes', 'mcqs',
        'announcements', 'faqs', 'policies', 'contacts', 'appointments',
        'class_schedules', 'orders', 'coupons'
    ];

    constructor(
        private permService: PermissionService,
        public auth: AuthService,
        private cdr: ChangeDetectorRef,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.loadAll();
    }

    loadAll(): void {
        this.loading = true;
        this.cdr.detectChanges();

        this.permService.getAllPermissions().subscribe({
            next: (res) => {
                this.allPermissions = res?.data || (Array.isArray(res) ? res : []);
                this.groupPermissions();
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        this.permService.getRoles().subscribe({
            next: (res) => {
                this.roles = res?.data || (Array.isArray(res) ? res : []);
                if (this.roles.length > 0) {
                    this.selectRole(this.roles[0]);
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        this.refreshUsers(); // ✅ Use separate method
    }

refreshUsers(): void {
    this.permService.getUsers().subscribe({
        next: (res) => {
            console.log('📦 Users received:', res);  // Debug
            if (res?.data) {
                this.users = [...res.data];  // ✅ New array reference
                console.log('👥 Users array updated:', this.users.length);  // Debug
            }
            this.cdr.detectChanges();  // Force detect changes
        },
        error: () => {
            this.cdr.detectChanges();
        }
    });
}
    groupPermissions(): void {
        this.permissionGroups = {};
        
        this.modules.forEach(module => {
            const modulePermissions = this.allPermissions.filter(p => p.includes(module));
            if (modulePermissions.length > 0) {
                this.permissionGroups[module] = modulePermissions;
            }
        });
        
        this.cdr.detectChanges();
    }

    get permissionModules(): string[] {
        return Object.keys(this.permissionGroups).sort();
    }

    selectRole(role: any): void {
        this.selectedRole = {
            ...role,
            permissions: [...(role.permissions ?? [])]
        };
        this.cdr.detectChanges();
    }

    hasPermission(perm: string): boolean {
        return this.selectedRole?.permissions?.includes(perm) ?? false;
    }

    togglePermission(perm: string): void {
        if (!this.selectedRole) return;
        const idx = this.selectedRole.permissions.indexOf(perm);
        if (idx > -1) {
            this.selectedRole.permissions.splice(idx, 1);
        } else {
            this.selectedRole.permissions.push(perm);
        }
        this.cdr.detectChanges();
    }

    toggleModule(module: string, event: Event): void {
        if (this.expandedModule === module) {
            this.expandedModule = null;
        } else {
            this.expandedModule = module;
        }
    }

    getAdminCount(): number {
        return this.users.filter(u => u.roles?.includes('admin')).length;
    }

    getRoleClass(role: string): string {
        switch(role) {
            case 'admin': return 'bg-red-100 text-red-700';
            case 'manager': return 'bg-green-100 text-green-700';
            case 'accounts': return 'bg-blue-100 text-blue-700';
            case 'executive': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    }

    isModuleAllChecked(module: string): boolean {
        return this.permissionGroups[module]?.every(p => this.hasPermission(p)) ?? false;
    }

    isModuleSomeChecked(module: string): boolean {
        const perms = this.permissionGroups[module] ?? [];
        return perms.some(p => this.hasPermission(p)) && !this.isModuleAllChecked(module);
    }

    savePermissions(): void {
        if (!this.selectedRole || this.selectedRole.name === 'admin') return;
        
        this.saveLoading = true;
        this.cdr.detectChanges();
        
        this.permService.updateRolePermissions(this.selectedRole.id, this.selectedRole.permissions).subscribe({
            next: (res) => {
                this.saveLoading = false;
                this.toast.success('Success', res?.message || 'Permissions updated successfully');
                
                const index = this.roles.findIndex(r => r.id === this.selectedRole.id);
                if (index !== -1) {
                    this.roles[index].permissions = [...this.selectedRole.permissions];
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.saveLoading = false;
                this.toast.error('Error', err?.error?.message || 'Error saving permissions');
                this.cdr.detectChanges();
            }
        });
    }

    assignRoleToUser(userId: number, event: Event): void {
        const role = (event.target as HTMLSelectElement).value;
        if (!role) return;
        
        this.permService.assignRole(userId, role).subscribe({
            next: (res) => {
                this.toast.success('Success', res?.message || 'Role assigned successfully');
                this.refreshUsers();
                this.cdr.detectChanges();
            },
            error: () => {
                this.toast.error('Error', 'Error assigning role');
                this.cdr.detectChanges();
            }
        });
    }

    createUser(): void {
        if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.role) {
            this.toast.error('Validation Error', 'Please fill all fields');
            return;
        }
        
        this.permService.createUser(this.newUser).subscribe({
            next: (res) => {
                this.toast.success('Success', res?.message || 'User created successfully');
                this.showCreateForm = false;
                this.newUser = { name: '', email: '', password: '', role: '' };
                this.refreshUsers();  // ✅ YAHI MAGIC LINE HAI
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.toast.error('Error', err?.error?.message || 'Error creating user');
                this.cdr.detectChanges();
            }
        });
    }
}