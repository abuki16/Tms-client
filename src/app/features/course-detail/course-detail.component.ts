import { Component, input, effect, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-course-detail",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./course-detail.component.html",
  styleUrl: "./course-detail.component.scss",
})
export class CourseDetailComponent {
  // Automatically receives the :id from the URL /courses/:id
  id = input.required<string>();
  public authService = inject(AuthService);

  constructor() {
    effect(() => {
      console.log(`Loading course detail for ID: ${this.id()}`);
    });
  }
}