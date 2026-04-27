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
import { StudentCheckout } from './components/student/pages/order/checkout/checkout';
import { MyCourses } from './components/student/pages/profile/my-courses/courses/courses';
import { GuardianCheckout } from './components/guardian/pages/order/checkout/checkout';
import { MyCoursesGuardian } from './components/guardian/pages/profile/my-courses/courses/courses';
import { InstructorLogin } from './components/auth/instructor-login/instructor-login';
import { InstructorLogout } from './components/auth/instructor-logout/instructor-logout';
import { InstructorLayout } from './components/instructor/layouts/instructor-layout/instructor-layout';
import { InstructorDashboard } from './components/instructor/pages/dashboard/dashboard';
import { InstructorProfile } from './components/instructor/pages/profile/profile-show/profile-show';
import { InstructorProfileEdit } from './components/instructor/pages/profile/profile-edit/profile-edit';
import { MyCourseDetail } from './components/student/pages/profile/my-courses/course-details/course-details';
import { GuardianCourseDetails } from './components/guardian/pages/profile/my-courses/course-details/course-details';
import { InstructorCourseList } from './components/instructor/pages/courses/course-list/course-list';
import { InstructorCourseDetail } from './components/instructor/pages/courses/course-detail/course-detail';
import { ClassScheduleList } from './components/instructor/pages/class-schedule/schedule-list/schedule-list';
import { ClassScheduleAdd } from './components/instructor/pages/class-schedule/schedule-add/schedule-add';
import { ClassScheduleEdit } from './components/instructor/pages/class-schedule/schedule-edit/schedule-edit';
import { BatchList } from './components/admin/pages/batches/batch-list/batch-list';
import { BatchAdd } from './components/admin/pages/batches/batch-add/batch-add';
import { BatchEdit } from './components/admin/pages/batches/batch-edit/batch-edit';
import { AnnouncementList } from './components/admin/pages/announcement/announcement-list/announcement-list';
import { AnnouncementAdd } from './components/admin/pages/announcement/announcement-add/announcement-add';
import { AnnouncementEdit } from './components/admin/pages/announcement/announcement-edit/announcement-edit';
import { InstructorAnnouncementList } from './components/instructor/pages/announcement/announcement-list/announcement-list';
import { InstructorAnnouncementAdd } from './components/instructor/pages/announcement/announcement-add/announcement-add';
import { InstructorAnnouncementEdit } from './components/instructor/pages/announcement/announcement-edit/announcement-edit';
import { AdminClassScheduleList } from './components/admin/pages/class-schedule/schedule-list/schedule-list';
import { AdminClassScheduleAdd } from './components/admin/pages/class-schedule/schedule-add/schedule-add';
import { AdminClassScheduleEdit } from './components/admin/pages/class-schedule/schedule-edit/schedule-edit';
import { Confirmation } from './components/student/pages/payment/confirmation/confirmation';
import { Cancellation } from './components/student/pages/payment/cancellation/cancellation';
import { AssessmentQueries } from './components/admin/pages/assessment/assessment-queries/assessment-queries';
import { AssignCourseAdd } from './components/admin/pages/course/assign/assign-add/assign-add';
import { AssignCourseList } from './components/admin/pages/course/assign/assign-list/assign-list';
import { AssignCourseEdit } from './components/admin/pages/course/assign/assign-edit/assign-edit';
import { QuizList } from './components/admin/pages/quiz/quiz-list/quiz-list';
import { QuizAdd } from './components/admin/pages/quiz/quiz-add/quiz-add';
import { QuizEdit } from './components/admin/pages/quiz/quiz-edit/quiz-edit';
import { InstructorMcqsList } from './components/instructor/pages/mcq/mcq-list/mcq-list';
import { InstructorMcqsAdd } from './components/instructor/pages/mcq/mcq-add/mcq-add';
import { InstructorMcqsEdit } from './components/instructor/pages/mcq/mcq-edit/mcq-edit';
import { InstructorQuizAdd } from './components/instructor/pages/quiz/quiz-add/quiz-add';
import { InstructorQuizList } from './components/instructor/pages/quiz/quiz-list/quiz-list';
import { InstructorQuizEdit } from './components/instructor/pages/quiz/quiz-edit/quiz-edit';
import { MyQuiz } from './components/student/pages/profile/my-quiz/quiz/quiz';
import { AssignAssessmentList } from './components/admin/pages/assessment/assigned-assessment/assigned-assessment-list/assigned-assessment-list';
import { GuardianAssessmentList } from './components/guardian/pages/assessments/assessment-list/assessment-list';
import { StudentAssessmentList } from './components/student/pages/assessments/assessment-list/assessment-list';
import { AttemptAssessment } from './components/student/pages/assessments/assessment-attempt/assessment-attempt';
import { AdminQuizAttempts } from './components/admin/pages/quiz/quiz-attempt/quiz-attempt';
import { AdminQuizCheck } from './components/admin/pages/quiz/quiz-check/quiz-check';
import { AdminQuizView } from './components/admin/pages/quiz/quiz-view/quiz-view';
import { AttemptedAssessment } from './components/admin/pages/assessment/assessment-attempt/assessment-attempt';
import { AssessmentCheck } from './components/admin/pages/assessment/assessment-check/assessment-check';
import { AssessmentView } from './components/admin/pages/assessment/assessment-view/assessment-view';
import { InstructorAssignmentList } from './components/instructor/pages/assignment/assignment-list/assignment-list';
import { InstructorAssignmentAdd } from './components/instructor/pages/assignment/assignment-add/assignment-add';
import { InstructorAssignmentEdit } from './components/instructor/pages/assignment/assignment-edit/assignment-edit';
import { GuestLayout } from './components/guest/layout/guest-layout/guest-layout';
import { GuestAssessmentList } from './components/guest/pages/assessment/assessment-list/assessment-list';
import { GuestAssessmentAttempt } from './components/guest/pages/assessment/assessment-attempt/assessment-attempt';
import { GuestAssessmentView } from './components/guest/pages/assessment/assessment-view/assessment-view';
import { GuestAssessmentResult } from './components/guest/pages/assessment/assessment-result/assessment-result';
import { StudentAssessmentView } from './components/student/pages/assessments/assessment-view/assessment-view';
import { StudentAssessmentResult } from './components/student/pages/assessments/assessment-result/assessment-result';
import { MyResult } from './components/student/pages/results/my-result/my-result';
import { InstructorQuizAttempts } from './components/instructor/pages/quiz/quiz-attempts/quiz-attempts';
import { InstructorQuizCheck } from './components/instructor/pages/quiz/quiz-check/quiz-check';
import { InstructorQuizView } from './components/instructor/pages/quiz/quiz-view/quiz-view';
import { InstructorAssignmentAttempts } from './components/instructor/pages/assignment/assignment-attempts/assignment-attempts';
import { AdminAssignmentAttempts } from './components/admin/pages/assignment/assignment-attempts/assignment-attempts';
import { AdminGrade } from './components/admin/pages/grades/grade/grade';
import { InstructorGrade } from './components/instructor/pages/grades/grade/grade';
import { InstructorStudentList } from './components/instructor/pages/students/student-list/student-list';
import { InstructorBatchList } from './components/instructor/pages/batches/batch-list/batch-list';
import { StudentResult } from './components/guardian/pages/results/student-result/student-result';
import { StudentClassScheduleList } from './components/student/pages/class-schedule/schedule-list/schedule-list';
import { GuardianConfirmation } from './components/guardian/pages/payment/confirmation/confirmation';
import { GuardianList } from './components/admin/pages/guardians/guardian-list/guardian-list';

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

      //Assign Course routes
      { path: 'admin/course/assign-list', component: AssignCourseList },
      { path: 'admin/course/assign-add', component: AssignCourseAdd },
      { path: 'admin/course/assign-edit/:id', component: AssignCourseEdit },

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

      { path: 'admin/guardian/list', component: GuardianList },

      // Assignment routes
      { path: 'admin/assignment/list', component: AssignmentList },
      { path: 'admin/assignment/add', component: AssignmentAdd },
      { path: 'admin/assignment/edit/:id', component: AssignmentEdit },
      { path: 'admin/assignment/attempts', component: AdminAssignmentAttempts },

      // Coupon routes
      { path: 'admin/coupon/list', component: CouponList },
      { path: 'admin/coupon/add', component: CouponAdd },
      { path: 'admin/coupon/edit/:id', component: CouponEdit },

      // MCQs routes
      { path: 'admin/mcqs/list', component: McqsList },
      { path: 'admin/mcqs/add', component: McqsAdd },
      { path: 'admin/mcqs/edit/:id', component: McqsEdit },


      // Quizes routes
      { path: 'admin/quiz/list', component: QuizList },
      { path: 'admin/quiz/add', component: QuizAdd },
      { path: 'admin/quiz/edit/:id', component: QuizEdit },

      // MCQs routes
      { path: 'admin/assessments/list', component: AssessmentList },
      { path: 'admin/assessments/add', component: AssessmentAdd },
      { path: 'admin/assessments/edit/:id', component: AssessmentEdit },
      { path: 'admin/assessments/queries', component: AssessmentQueries },
      { path: 'admin/assigned-assessments/list', component: AssignAssessmentList },
      { path: 'admin/assessment-attempts/list', component: AttemptedAssessment },
      { path: 'admin/assessment/check/:id', component: AssessmentCheck },
      { path: 'admin/assessment/view/:id',component: AssessmentView},


      // Batch routes
      { path: 'admin/batches/list', component: BatchList },
      { path: 'admin/batches/add', component: BatchAdd },
      { path: 'admin/batches/edit/:id', component: BatchEdit },

      // Announcement routes
      { path: 'admin/announcement/list', component: AnnouncementList },
      { path: 'admin/announcement/add', component: AnnouncementAdd },
      { path: 'admin/announcement/edit/:id', component: AnnouncementEdit },

      // Class Schedule routes
      { path: 'admin/class-schedule/list', component: AdminClassScheduleList },
      { path: 'admin/class-schedule/add', component: AdminClassScheduleAdd },
      { path: 'admin/class-schedule/edit/:id', component: AdminClassScheduleEdit },

      { path: 'admin/quiz/attempts', component: AdminQuizAttempts },
      { path: 'admin/quiz/check/:attemptId', component: AdminQuizCheck },
      { path: 'admin/quiz/view/:attemptId', component: AdminQuizView },


      { path: 'admin/grade', component: AdminGrade },

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
      { path: 'guardian/checkout/:id', component: GuardianCheckout },
      { path: 'guardian/my-courses', component: MyCoursesGuardian },
      { path: 'guardian/course/:id', component: GuardianCourseDetails},
      { path: 'guardian/student-assessments', component: GuardianAssessmentList },
      { path: 'guardian/student-results', component: StudentResult },
      { path: 'guardian/payment/confirmation',  component: GuardianConfirmation  },

      { path: '', redirectTo: 'guardian/dashboard', pathMatch: 'full' },
    ],
  },

  // Student Routes
  { path: 'student/login', component: StudentLogin },
  {
    path: '',
    canActivate: [authGuard],
    component: StudentDashboardLayout, // layout wrapper
    children: [
      { path: 'student/logout', component: StudentLogout },
      { path: 'student/profile', component: StudentProfile },
      { path: 'student/profile/edit', component: StudentProfileEdit },
      { path: 'student/dashboard', component: StudentDashboard },
      { path: 'student/courses/list', component: StudentCourseList },
      { path: 'student/course/detail/:id', component: StudentCourseDetail},
      { path: 'student/checkout/:courseId', component: StudentCheckout },
      { path: 'student/my-courses', component: MyCourses },
      { path: 'student/class-schedule', component: StudentClassScheduleList },
      { path: 'student/assignments/:courseId', component: AssignmentList },
      { path: 'student/course/:courseId', component: MyCourseDetail },
      { path: 'student/payment/confirmation', component: Confirmation },
      { path: 'student/payment/cancellation', component: Cancellation },
      { path: 'student/quiz/:quizId', component: MyQuiz },
      { path: 'student/my-assessments', component: StudentAssessmentList },
      { path: 'student/assessment/attempt/:assignAssessmentId', component: AttemptAssessment },
      { path: 'student/assessment/view/:id', component: StudentAssessmentView },
      { path: 'student/assessment-result', component: StudentAssessmentResult },
      { path: 'student/my-results', component: MyResult }

    ]
  },

  {
    path: '',
    component: StudentLayout,
    children: [
      { path: 'student/registration', component: StudentRegistration },
    ]
  },

    // Instructor Routes
  { path: 'instructor/login', component: InstructorLogin },
  {
    path: '',
    canActivate: [authGuard],
    component: InstructorLayout, // layout wrapper
    children: [
      { path: 'instructor/logout', component: InstructorLogout },
      { path: 'instructor/dashboard', component: InstructorDashboard },
      { path: 'instructor/students/list', component: InstructorStudentList },
      { path: 'instructor/batches/list', component: InstructorBatchList },
      { path: 'instructor/profile', component: InstructorProfile },
      { path: 'instructor/profile/edit', component: InstructorProfileEdit },
      { path: 'instructor/courses/list', component: InstructorCourseList },
      { path: 'instructor/course/detail/:id', component: InstructorCourseDetail},
      { path: 'instructor/class-schedule/list', component: ClassScheduleList },
      { path: 'instructor/class-schedule/add', component: ClassScheduleAdd },
      { path: 'instructor/class-schedule/edit/:id', component: ClassScheduleEdit },
      { path: 'instructor/announcement/list', component: InstructorAnnouncementList },
      { path: 'instructor/announcement/add', component: InstructorAnnouncementAdd },
      { path: 'instructor/announcement/edit/:id', component: InstructorAnnouncementEdit },
      { path: 'instructor/mcqs/list', component: InstructorMcqsList },
      { path: 'instructor/mcqs/add', component: InstructorMcqsAdd },
      { path: 'instructor/mcqs/edit/:id', component: InstructorMcqsEdit },
      // Quiz routes
      { path: 'instructor/quiz/list', component: InstructorQuizList },
      { path: 'instructor/quiz/add', component: InstructorQuizAdd },
      { path: 'instructor/quiz/edit/:id', component: InstructorQuizEdit },

      { path: 'instructor/assignment/list', component: InstructorAssignmentList },
      { path: 'instructor/assignment/add', component: InstructorAssignmentAdd },
      { path: 'instructor/assignment/edit/:id', component: InstructorAssignmentEdit },

      { path: 'instructor/quiz/attempts', component: InstructorQuizAttempts },
      { path: 'instructor/quiz/check/:attemptId', component: InstructorQuizCheck },
      { path: 'instructor/quiz/view/:attemptId', component: InstructorQuizView },
      { path: 'instructor/assignment/attempts', component: InstructorAssignmentAttempts },

      { path: 'instructor/grade', component: InstructorGrade   },


    ]
  },
  {path: 'guest',component: GuestLayout,
      children: [
      {path: 'guest-assessments', component: GuestAssessmentList },
      { path: 'assessment/attempt/:assignAssessmentId', component: GuestAssessmentAttempt },
      {path: 'assessment/attempt/:assignAssessmentId',component: GuestAssessmentAttempt },
      { path: 'assessment/view/:id', component: GuestAssessmentView },
        { path: 'assessment-result', component: GuestAssessmentResult },

      { path: '', redirectTo: 'guest-assessments', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
