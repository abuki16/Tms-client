import { Routes } from "@angular/router";
import { roleGuard } from './guards/role.guard';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: "unauthorized",
    component: UnauthorizedComponent,
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/student-dashboard/student-dashboard.component").then(
        (m) => m.StudentDashboardComponent,
      ),
    canActivate: [roleGuard('Student', 'Instructor', 'Admin')]
  },
  {
    path: "instructor-dashboard",
    loadComponent: () =>
      import("./features/instructor-dashboard/instructor-dashboard.component").then(
        (m) => m.InstructorDashboardComponent,
      ),
    canActivate: [roleGuard('Instructor', 'Admin')]
  },
  {
    path: "admin-dashboard",
    loadComponent: () =>
      import("./features/admin-dashboard/admin-dashboard.component").then(
        (m) => m.AdminDashboardComponent,
      ),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/courses',
    loadComponent: () =>
      import('./features/course-management/course-management.component')
        .then(m => m.CourseManagementComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./features/user-management/user-management.component')
        .then(m => m.UserManagementComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/certificates',
    loadComponent: () =>
      import('./features/certificate-management/certificate-management.component')
        .then(m => m.CertificateManagementComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'admin/registrar-analytics',
    loadComponent: () =>
      import('./features/registrar-dashboard/registrar-dashboard.component')
        .then(m => m.RegistrarDashboardComponent),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: "courses/:id",
    loadComponent: () =>
      import("./features/course-detail/course-detail.component").then(
        (m) => m.CourseDetailComponent,
      ),
  },
  {
    path: "enroll/:id",
    loadComponent: () =>
      import("./features/enrollment-form/enrollment-form.component").then(
        (m) => m.EnrollmentFormComponent,
      ),
  },
  {
    path: "enrollments",
    loadComponent: () =>
      import("./features/enrollment-list/enrollment-list.component").then(
        (m) => m.EnrollmentListComponent,
      ),
    canActivate: [roleGuard('Admin')]
  },
  {
    path: 'grade-submission',
    loadComponent: () =>
      import('./features/grade-submission/grade-submission.component')
        .then(m => m.GradeSubmissionComponent),
    canActivate: [roleGuard('Instructor', 'Admin')]
  },
  {
    path: 'instructor/grading',
    loadComponent: () =>
      import('./features/instructor-grading/instructor-grading.component')
        .then(m => m.InstructorGradingComponent),
    canActivate: [roleGuard('Instructor', 'Admin')]
  },
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "**", redirectTo: "login" }
];