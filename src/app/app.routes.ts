import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { AdminLayout } from './components/admin/layouts/admin-layout/admin-layout';
import { Dashboard } from './components/admin/pages//dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { FaqList } from './components/admin/pages/faq/faq-list/faq-list';
import { FaqAdd } from './components/admin/pages/faq/faq-add/faq-add';
import { FaqEdit } from './components/admin/pages/faq/faq-edit/faq-edit';
import { InstructorList } from './components/admin/pages/instructor/instructor-list/instructor-list';
import { InstructorAdd } from './components/admin/pages/instructor/instructor-add/instructor-add';
import { InstructorEdit } from './components/admin/pages/instructor/instructor-edit/instructor-edit';
import { CourseList } from './components/admin/pages/course/course-list/course-list';
import { CourseAdd } from './components/admin/pages/course/course-add/course-add';
import { CourseEdit } from './components/admin/pages/course/course-edit/course-edit';
import { PolicyList } from './components/admin/pages/policy/policy-list/policy-list';
import { PolicyAdd } from './components/admin/pages/policy/policy-add/policy-add';
import { PolicyEdit } from './components/admin/pages/policy/policy-edit/policy-edit';
import { Logout } from './components/auth/logout/logout';
import { StudentRegistration } from './components/student/pages/registration/student-registration/student-registration';
import { StudentLayout } from './components/student/layouts/student-layout/student-layout/student-layout';

export const routes: Routes = [
  { path: 'login', component: Login },


  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [

      { path: 'admin/logout', component: Logout },
      { path: 'admin/dashboard', component: Dashboard },

      // FAQ routes
      { path: 'admin/faq/list', component: FaqList },
      { path: 'admin/faq/add', component: FaqAdd },
      { path: 'admin/faq/edit/:id', component: FaqEdit },

      // Instructor routes
      { path: 'admin/instructor/list', component: InstructorList },
      { path: 'admin/instructor/add', component: InstructorAdd },
      { path: 'admin/instructor/edit/:id', component: InstructorEdit },

      // Course routes
      { path: 'admin/course/list', component: CourseList },
      { path: 'admin/course/add', component: CourseAdd },
      { path: 'admin/course/edit/:id', component: CourseEdit },

       // Policy routes
      { path: 'admin/policy/list', component: PolicyList },
      { path: 'admin/policy/add', component: PolicyAdd },
      { path: 'admin/policy/edit/:id', component: PolicyEdit },

      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: StudentLayout,
    children: [
      { path: 'student/registration', component: StudentRegistration },
    ]
  },
  { path: '**', redirectTo: '' }
];
