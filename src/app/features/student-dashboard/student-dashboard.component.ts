// These are the Angular functions we need. signal() and computed() come from Angular's core.
import { Component, signal, computed, inject } from "@angular/core";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { Course } from "../../models/course.model";
import { rxResource } from "@angular/core/rxjs-interop";
import { CourseService } from "../../services/course.service";

// The @Component decorator tells Angular: "This class is a visual component."
@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent {
  // Inject the CourseService instance to communicate with the .NET API
  private api = inject(CourseService);

  studentName = signal("Liya Kebede");
  earnedCredits = signal(45);

  // computed() creates a read-only signal that derives its value from other signals.
  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress",
  );

  // rxResource fetches the course catalog asynchronously from the backend API
  // and surfaces it as signals (.value(), .isLoading(), .error()) automatically.
  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  // signal(null) means: "This signal holds either a Course or nothing."
  selectedCourse = signal<Course | null>(null);

  registerForClass() {
    this.earnedCredits.update((c) => c + 3);
  }

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log('Enrollment requested for:', course.title);
  }
}