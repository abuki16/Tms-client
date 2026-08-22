import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-course-list.component.html',
  styles: [] // Replaced styleUrls with empty styles array
})
export class AdminCourseListComponent {
  protected auth = inject(AuthService);

  course = {
    id: 1,
    title: 'Advanced .NET Development'
  };

  deleteCourse(id: number): void {
    console.log(`Deleting course with id: ${id}`);
  }
}