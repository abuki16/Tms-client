import { Component, signal, computed, inject, OnInit } from "@angular/core";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { Course } from "../../models/course.model";
import { RouterLink } from "@angular/router";
import { rxResource } from "@angular/core/rxjs-interop";
import { CourseService } from "../../services/course.service";
import { EnrollmentStore } from "../../store/enrollment.store";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  
  imports: [CourseCardComponent,RouterLink],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent implements OnInit {
  private api = inject(CourseService);
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  studentName = signal("Liya Kebede");
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

  /**
   * Dynamically calculates live enrollment counts using course.id / courseId.
   */
  getEnrolledCount(courseId: number | string): number {
    return this.store.entities().filter(
      (e: any) => (e.courseId === courseId || e.courseCode === courseId) && e.status !== 'Rejected'
    ).length;
  }

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    
    this.store.enrollStudent({
      courseCode: course.code, 
      studentId: 1, 
    });

    console.log('Enrollment requested for course code:', course.code);
  }
}