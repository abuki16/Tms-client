import { Component, signal, computed, inject, OnInit } from "@angular/core";
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
  imports: [CourseCardComponent],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(CourseService);
  private authService = inject(AuthService);
  private router = inject(Router);
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  // Default student profile set to Liya Kebede
  studentName = signal("Liya Kebede");
  studentId = signal<number>(1); // Default numeric ID assigned to Liya
  earnedCredits = signal(45);

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress",
  );

  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  selectedCourse = signal<Course | null>(null);

  registerForClass() {
    this.earnedCredits.update((c) => c + 3);
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

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
   
    // Automatically uses Liya's default student ID for the enrollment payload
    this.store.enrollStudent({
      courseCode: course.code,
      studentId: this.studentId(), 
    });

    console.log(`Enrollment requested for ${this.studentName()} (ID: ${this.studentId()}) in course:`, course.code);
  }
}