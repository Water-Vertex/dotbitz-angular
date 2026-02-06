import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { AdminLayout } from './components/admin/layouts/admin-layout/admin-layout';
import { Dashboard } from './components/admin/pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

// FAQ
import { FaqList } from './components/admin/pages/faq/faq-list/faq-list';
import { FaqAdd } from './components/admin/pages/faq/faq-add/faq-add';
import { FaqEdit } from './components/admin/pages/faq/faq-edit/faq-edit';

// Instructor
import { InstructorList } from './components/admin/pages/instructor/instructor-list/instructor-list';
import { InstructorAdd } from './components/admin/pages/instructor/instructor-add/instructor-add';
import { InstructorEdit } from './components/admin/pages/instructor/instructor-edit/instructor-edit';

// Course
import { CourseList } from './components/admin/pages/course/course-list/course-list';
import { CourseAdd } from './components/admin/pages/course/course-add/course-add';
import { CourseEdit } from './components/admin/pages/course/course-edit/course-edit';

// Course Curriculum
import { CourseCurriculumList } from './components/admin/pages/course-curriculum/course-curriculum-list/course-curriculum-list';
import { CourseCurriculumAdd } from './components/admin/pages/course-curriculum/course-curriculum-add/course-curriculum-add';
import { CourseCurriculumEdit } from './components/admin/pages/course-curriculum/course-curriculum-edit/course-curriculum-edit';

// Assignment
import { AssignmentList } from './components/admin/pages/assignment/assignment-list/assignment-list';
import { AssignmentAdd } from './components/admin/pages/assignment/assignment-add/assignment-add';
import { AssignmentEdit } from './components/admin/pages/assignment/assignment-edit/assignment-edit';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
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

      // Course Curriculum routes
      { path: 'admin/course-curriculum/list', component: CourseCurriculumList },
      { path: 'admin/course-curriculum/add', component: CourseCurriculumAdd },
      { path: 'admin/course-curriculum/edit/:id', component: CourseCurriculumEdit },

      // Assignment routes
      { path: 'admin/assignment/list', component: AssignmentList },
      { path: 'admin/assignment/add', component: AssignmentAdd },
      { path: 'admin/assignment/edit/:id', component: AssignmentEdit },

      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
