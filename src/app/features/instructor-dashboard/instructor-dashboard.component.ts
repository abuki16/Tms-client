import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnrollmentStore } from '../../store/enrollment.store';
import { AuthService } from '../../services/auth.service';

export interface AssignedCourse {
  id: number;
  code: string;
  title: string;
  maxCapacity: number;
  enrollmentCount: number;
  instructorId?: string | null;
}

@Component({
  selector: 'tms-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss'
})
export class InstructorDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);
  authService = inject(AuthService);
  private http = inject(HttpClient);

  assignedCourses = signal<AssignedCourse[]>([]);
  isLoadingCourses = signal(false);

  // Filter enrollments strictly to the instructor's assigned courses
  myCourseEnrollments = computed(() => {
    const courseIds = new Set(this.assignedCourses().map(c => c.id));
    return this.store.entities().filter(e => courseIds.has(Number(e.courseId)));
  });

  approvedCount = computed(() => {
    return this.myCourseEnrollments().filter(e => e.status === 'Approved').length;
  });

  pendingCount = computed(() => {
    return this.myCourseEnrollments().filter(e => e.status === 'Pending').length;
  });

  gradedCount = computed(() => {
    return this.myCourseEnrollments().filter(e => e.grade != null).length;
  });

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.store.loadEnrollments();
    this.loadAssignedCourses();
  }

  loadAssignedCourses() {
    this.isLoadingCourses.set(true);
    // GET /api/courses/assigned returns courses assigned to the current instructor
    this.http.get<AssignedCourse[]>('/api/courses/assigned').subscribe({
      next: (courses) => {
        this.assignedCourses.set(courses || []);
        this.isLoadingCourses.set(false);
      },
      error: () => {
        // Fallback to GET /api/courses which filters by role on the backend
        this.http.get<any>('/api/courses?pageSize=100').subscribe({
          next: (res) => {
            const items = res?.items ? res.items : (Array.isArray(res) ? res : []);
            this.assignedCourses.set(items);
            this.isLoadingCourses.set(false);
          },
          error: () => {
            this.assignedCourses.set([]);
            this.isLoadingCourses.set(false);
          }
        });
      }
    });
  }

  getStudentsForCourse(courseId: number) {
    return this.myCourseEnrollments().filter(e => Number(e.courseId) === courseId);
  }
}