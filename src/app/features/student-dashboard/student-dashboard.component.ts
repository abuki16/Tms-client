import { Component, signal, computed, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { Course } from "../../models/course.model";
import { Router, RouterLink } from "@angular/router";
import { rxResource } from "@angular/core/rxjs-interop";
import { CourseService } from "../../services/course.service";
import { EnrollmentStore } from "../../store/enrollment.store";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CourseCardComponent, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(CourseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);
  store = inject(EnrollmentStore);

  studentProfile = signal<any>(null);

  // Dynamically resolve logged-in student name and ID
  studentName = computed(() =>
    this.studentProfile()?.name || this.authService.currentUser()?.displayName || "Student"
  );

  studentId = computed<number>(() =>
    this.studentProfile()?.id || this.authService.currentUser()?.studentId || 1
  );

  bonusCredits = signal(0);

  // Dynamically compute earned credits:
  // 3 credits for every completed course with a passing grade for this student in store + any manual registration credits
  earnedCredits = computed(() => {
    const sId = this.studentId();
    const completedCoursesCount = this.store.entities().filter(
      (e: any) => Number(e.studentId) === sId && e.grade != null && Number(e.grade) >= 2.0
    ).length;

    return (completedCoursesCount * 3) + this.bonusCredits();
  });

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress",
  );

  myPendingEnrollments = computed(() => {
    const sId = this.studentId();
    return this.store.entities().filter(
      (e: any) => Number(e.studentId) === sId && e.status === 'Pending'
    );
  });

  myPendingCount = computed(() => this.myPendingEnrollments().length);

  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  selectedCourse = signal<Course | null>(null);

  ngOnInit() {
    this.store.loadEnrollments();
    this.fetchCurrentStudentProfile();
  }

  fetchCurrentStudentProfile() {
    this.http.get<any>('/api/students/me').subscribe({
      next: (profile) => {
        if (profile) {
          this.studentProfile.set(profile);
        }
      },
      error: (err) => {
        console.warn('Could not fetch student profile, falling back to auth token info', err);
      }
    });
  }

  registerForClass() {
    this.bonusCredits.update((b) => b + 3);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEnrolledCount(courseId: number | string): number {
    return this.store.entities().filter(
      (e: any) => (e.courseId === courseId || e.courseCode === courseId) && e.status !== 'Rejected'
    ).length;
  }

  isStudentEnrolledInCourse(course: Course): boolean {
    const sId = this.studentId();
    return this.store.entities().some(
      (e: any) => Number(e.studentId) === sId && 
                  (Number(e.courseId) === Number(course.id) || 
                   (e.courseCode && course.code && e.courseCode.trim().toLowerCase() === course.code.trim().toLowerCase())) &&
                  e.status !== 'Rejected'
    );
  }

  getStudentEnrollmentStatus(course: Course): string | null {
    const sId = this.studentId();
    const enrollment = this.store.entities().find(
      (e: any) => Number(e.studentId) === sId && 
                  (Number(e.courseId) === Number(course.id) || 
                   (e.courseCode && course.code && e.courseCode.trim().toLowerCase() === course.code.trim().toLowerCase())) &&
                  e.status !== 'Rejected'
    );
    return enrollment ? enrollment.status : null;
  }

  handleEnroll(course: Course) {
    if (this.isStudentEnrolledInCourse(course)) {
      return;
    }

    this.selectedCourse.set(course);
   
    // Uses the authenticated student's dynamic ID for the enrollment payload
    this.store.enrollStudent({
      courseCode: course.code,
      studentId: this.studentId(), 
    });

    console.log(`Enrollment requested for ${this.studentName()} (ID: ${this.studentId()}) in course:`, course.code);
  }
}