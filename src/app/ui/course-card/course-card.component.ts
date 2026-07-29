import { Component, input, output, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Course } from "../../models/course.model";

@Component({
  selector: "tms-course-card",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./course-card.component.html",
  styleUrl: "./course-card.component.scss",
})
export class CourseCardComponent {
  course = input.required<Course>();
  enrollClicked = output<Course>();
  
  private router = inject(Router);

  onEnroll() {
  console.log('Enroll button clicked! Course ID:', this.course().id);
  this.enrollClicked.emit(this.course());
  this.router.navigate(['/enroll', this.course().id]);
}
}