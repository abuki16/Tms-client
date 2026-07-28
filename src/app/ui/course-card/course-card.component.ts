import { Component, input, output } from "@angular/core";
import { RouterLink } from "@angular/router";
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

onEnroll() {
    this.enrollClicked.emit(this.course());
  }
}