import { Component, input, output } from '@angular/core';
import { Course } from '../../models/course.model';

@Component({
  selector: 'tms-course-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ course().title }}</h3>
      <p>{{ course().code }}</p>
      <button (click)="enrollClicked.emit(course())">Enroll</button>
    </div>
  `
})
export class CourseCardComponent {
  course = input.required<Course>();
  enrollClicked = output<Course>(); // Must emit the course object

  onEnroll() {

    this.enrollClicked.emit(this.course());

  }
}