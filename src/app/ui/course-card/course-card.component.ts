import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../models/course.model';

@Component({
  selector: 'tms-course-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card-enrolled]="isEnrolled">
      <h3>{{ course.title }}</h3>
      <p class="course-code">{{ course.code }}</p>

      @if (isEnrolled) {
        <div class="enrolled-status-banner" [class.status-approved]="enrollmentStatus === 'Approved'" [class.status-pending]="enrollmentStatus === 'Pending'">
          @if (enrollmentStatus === 'Pending') {
            <span class="status-icon">⏳</span>
            <span class="status-text">Enrollment pending administrator review</span>
          } @else {
            <span class="status-icon">✅</span>
            <span class="status-text">You are already enrolled in this course</span>
          }
        </div>
      }

      <button 
        type="button"
        class="btn-enroll"
        [class.btn-enrolled]="isEnrolled"
        [disabled]="isEnrolled" 
        (click)="onEnroll()"
        [title]="isEnrolled ? 'You have already enrolled in this course' : 'Enroll in ' + course.title">
        @if (isEnrolled) {
          @if (enrollmentStatus === 'Pending') {
            <span>⏳ Requested</span>
          } @else {
            <span>✓ Already Enrolled</span>
          }
        } @else {
          <span>Enroll</span>
        }
      </button>
    </div>
  `,
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;
  @Input() isEnrolled: boolean = false;
  @Input() enrollmentStatus: string | null = null;
  @Output() enrollClicked = new EventEmitter<Course>();

  onEnroll() {
    if (this.isEnrolled) {
      return;
    }
    this.enrollClicked.emit(this.course);
  }
}