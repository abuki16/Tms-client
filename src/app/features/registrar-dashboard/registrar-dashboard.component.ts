import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RegistrarService } from '../../services/registrar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'tms-registrar-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './registrar-dashboard.component.html',
  styleUrl: './registrar-dashboard.component.scss'
})
export class RegistrarDashboardComponent implements OnInit {
  private registrarService = inject(RegistrarService);
  public authService = inject(AuthService);

  highGpaCount = signal<number>(0);
  coursesByEnrollment = signal<{ title: string; enrollmentCount: number }[]>([]);
  averageGpaPerCourse = signal<{ courseTitle: string; averageGpa: number }[]>([]);
  unenrolledStudents = signal<string[]>([]);
  
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.loadRegistrarData();
  }

  loadRegistrarData() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 1. High GPA Active Students Count
    this.registrarService.getActiveHighGpaCount().subscribe({
      next: (res) => this.highGpaCount.set(res.count),
      error: () => this.errorMessage.set('Failed to load registrar statistics.')
    });

    // 2. Courses Ranked by Enrollments
    this.registrarService.getCoursesByEnrollments().subscribe({
      next: (data) => this.coursesByEnrollment.set(data),
      error: () => {}
    });

    // 3. Average GPA per Course
    this.registrarService.getAverageGpaPerCourse().subscribe({
      next: (data) => this.averageGpaPerCourse.set(data),
      error: () => {}
    });

    // 4. Unenrolled Students List
    this.registrarService.getUnenrolledStudents().subscribe({
      next: (data) => {
        this.unenrolledStudents.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  refreshData() {
    this.loadRegistrarData();
  }
}