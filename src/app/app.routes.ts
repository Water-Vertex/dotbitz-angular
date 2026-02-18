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
import { CourseCurriculumList } from './components/admin/pages/course-curriculum/course-curriculum-list/course-curriculum-list';
import { CourseCurriculumAdd } from './components/admin/pages/course-curriculum/course-curriculum-add/course-curriculum-add';
import { CourseCurriculumEdit } from './components/admin/pages/course-curriculum/course-curriculum-edit/course-curriculum-edit';
import { StudentList } from './components/admin/pages/student/student-list/student-list';
import { StudentAdd } from './components/admin/pages/student/student-add/student-add';
import { StudentEdit } from './components/admin/pages/student/student-edit/student-edit';
import { AssignmentAdd } from './components/admin/pages/assignment/assignment-add/assignment-add';
import { AssignmentEdit } from './components/admin/pages/assignment/assignment-edit/assignment-edit';
import { AssignmentList } from './components/admin/pages/assignment/assignment-list/assignment-list';
import { CouponAdd } from './components/admin/pages/coupon/coupon-add/coupon-add';
import { CouponList } from './components/admin/pages/coupon/coupon-list/coupon-list';
import { CouponEdit } from './components/admin/pages/coupon/coupon-edit/coupon-edit';
import { McqsList } from './components/admin/pages/mcq/mcq-list/mcq-list';
import { McqsAdd } from './components/admin/pages/mcq/mcq-add/mcq-add';
import { McqsEdit } from './components/admin/pages/mcq/mcq-edit/mcq-edit';
import { AssessmentList } from './components/admin/pages/assessment/assessment-list/assessment-list';
import { AssessmentAdd } from './components/admin/pages/assessment/assessment-add/assessment-add';
import { AssessmentEdit } from './components/admin/pages/assessment/assessment-edit/assessment-edit';
import { GuardianLayout } from './components/guardian/layouts/guardian-layout/guardian-layout';
import { ProfileShow } from './components/guardian/pages/profile/profile-show/profile-show';
import { ProfileEdit } from './components/guardian/pages/profile/profile-edit/profile-edit';
import { GuardianDashboard } from './components/guardian/pages/dashboard/dashboard';
import { GuardianLogin } from './components/auth/guardian-login/guardian-login';
import { StudentDashboardLayout } from './components/student/layouts/student-dashboard-layout/student-dashboard-layout';
import { StudentProfile } from './components/student/pages/profile/profile-show/profile-show';
import { StudentProfileEdit } from './components/student/pages/profile/profile-edit/profile-edit';
import { StudentDashboard } from './components/student/pages/dashboard/dashboard';
import { StudentLogin } from './components/auth/student-login/student-login';
import { GuardianLogout } from './components/auth/guardian-logout/guardian-logout';
import { StudentLogout } from './components/auth/student-logout/student-logout';
import { StudentCourseList } from './components/student/pages/courses/course-list/course-list';
import { GuardianCourseList } from './components/guardian/pages/courses/course-list/course-list';
import { GuardianCourseDetail } from './components/guardian/pages/courses/course-detail/course-detail';
import { StudentCourseDetail } from './components/student/pages/courses/course-detail/course-detail';

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

       //  Course Curriculum routes
      { path: 'admin/course/curriculum/list', component: CourseCurriculumList },
      { path: 'admin/course/curriculum/add', component: CourseCurriculumAdd },
      { path: 'admin/course/curriculum/edit/:id', component: CourseCurriculumEdit },

       // Policy routes
      { path: 'admin/policy/list', component: PolicyList },
      { path: 'admin/policy/add', component: PolicyAdd },
      { path: 'admin/policy/edit/:id', component: PolicyEdit },

       // Student routes
      { path: 'admin/student/list', component: StudentList },
      { path: 'admin/student/add', component: StudentAdd },
      { path: 'admin/student/edit/:id', component: StudentEdit },

      // Assignment routes
      { path: 'admin/assignment/list', component: AssignmentList },
      { path: 'admin/assignment/add', component: AssignmentAdd },
      { path: 'admin/assignment/edit/:id', component: AssignmentEdit },

      // Coupon routes
      { path: 'admin/coupon/list', component: CouponList },
      { path: 'admin/coupon/add', component: CouponAdd },
      { path: 'admin/coupon/edit/:id', component: CouponEdit },

      // MCQs routes
      { path: 'admin/mcqs/list', component: McqsList },
      { path: 'admin/mcqs/add', component: McqsAdd },
      { path: 'admin/mcqs/edit/:id', component: McqsEdit },

      // MCQs routes
      { path: 'admin/assessments/list', component: AssessmentList },
      { path: 'admin/assessments/add', component: AssessmentAdd },
      { path: 'admin/assessments/edit/:id', component: AssessmentEdit },



      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' }
    ]
  },

  // Guardian Routes

  { path: 'guardian/login', component: GuardianLogin },
  {
    path: '',
    component: GuardianLayout,
    canActivate: [authGuard],
    children: [
      { path: 'guardian/logout', component: GuardianLogout },
      { path: 'guardian/dashboard', component: GuardianDashboard },
      { path: 'guardian/profile', component: ProfileShow },
      { path: 'guardian/profile/edit', component: ProfileEdit },
      { path: 'guardian/courses/list', component: GuardianCourseList },
      { path: 'guardian/course/detail/:id', component: GuardianCourseDetail},

      { path: '', redirectTo: 'guardian/dashboard', pathMatch: 'full' },
    ],
  },

  // Student Routes
{ path: 'student/login', component: StudentLogin },
  {
  path: '',
  component: StudentDashboardLayout, // layout wrapper
  children: [
    { path: 'student/logout', component: StudentLogout },
    { path: 'student/profile', component: StudentProfile },
    { path: 'student/profile/edit', component: StudentProfileEdit },
    { path: 'student/dashboard', component: StudentDashboard },
    { path: 'student/courses/list', component: StudentCourseList },
    { path: 'student/course/detail/:id', component: StudentCourseDetail}
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
