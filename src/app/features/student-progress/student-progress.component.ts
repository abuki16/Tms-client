import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EnrollmentStore } from '../../store/enrollment.store';

interface StudentProgressData {
  id: number;
  name: string;
  registrationNumber: string;
  gpa: number;
  earnedCredits: number;
  graduationStatus: string;
  isGraduationEligible: boolean;
  enrollments: Array<{
    id: number;
    courseId: number;
    courseCode: string;
    courseName: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    completionStatus?: string;
    isCompleted?: boolean;
    isApproved?: boolean;
    enrolledAt: string;
    grade?: number | null;
  }>;
  certificates?: Array<{
    id: number;
    serialNumber: string;
    courseId: number;
    courseTitle: string;
    issuedAt: string;
  }>;
}

@Component({
  selector: 'tms-student-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-progress.component.html',
  styleUrl: './student-progress.component.scss'
})
export class StudentProgressComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  store = inject(EnrollmentStore);

  isLoading = signal(true);
  error = signal<string | null>(null);
  progressData = signal<StudentProgressData | null>(null);

  studentName = computed(() => {
    return this.progressData()?.name || this.authService.currentUser()?.displayName || 'Student';
  });

  studentId = computed(() => {
    return this.progressData()?.id || this.authService.currentUser()?.studentId || 1;
  });

  registrationNumber = computed(() => {
    return this.progressData()?.registrationNumber || 'TMS-2026-XXXX';
  });

  gpa = computed(() => {
    return this.progressData()?.gpa ?? 0;
  });

  hasOfficialGpa = computed(() => {
    return this.gpa() > 0;
  });

  // Combine store entities with any student progress records
  studentEnrollments = computed(() => {
    const currentId = this.studentId();
    // Filter enrollments from reactive store that belong to this student
    const storeItems = this.store.entities().filter(
      (e: any) => Number(e.studentId) === currentId
    );

    if (storeItems.length > 0) {
      return storeItems;
    }

    return this.progressData()?.enrollments || [];
  });

  // Automatically compute credits: 45 baseline + 3 credits per enrolled non-rejected course
  earnedCredits = computed(() => {
    const enrolled = this.studentEnrollments().filter((e: any) => e.status !== 'Rejected');
    return 45 + (enrolled.length * 3);
  });

  graduationProgressPercentage = computed(() => {
    const credits = this.earnedCredits();
    return Math.min(100, Math.round((credits / 120) * 100));
  });

  graduationStatus = computed(() => {
    return this.earnedCredits() >= 120 ? 'Eligible for Graduation' : 'In Progress';
  });

  pendingCount = computed(() => {
    return this.studentEnrollments().filter((e: any) => e.status === 'Pending').length;
  });

  approvedCount = computed(() => {
    return this.studentEnrollments().filter((e: any) => e.status === 'Approved').length;
  });

  certificates = computed(() => {
    return this.progressData()?.certificates || [];
  });

  getCourseTitle(enrollment: any): string {
    return enrollment.courseName || enrollment.courseTitle || `Course #${enrollment.courseId}`;
  }

  getCourseCode(enrollment: any): string {
    return enrollment.courseCode || `CRS-${enrollment.courseId}`;
  }

  getStatusLabel(enrollment: any): string {
    if (enrollment.grade != null || enrollment.isCompleted || enrollment.completionStatus === 'Completed') {
      return `🎓 Completed${enrollment.grade != null ? ` (Grade: ${enrollment.grade})` : ''}`;
    }
    if (enrollment.status === 'Approved' || enrollment.isApproved) {
      return '✅ Approved & Active';
    }
    if (enrollment.status === 'Pending') {
      return '⏳ Pending Review';
    }
    if (enrollment.status === 'Rejected') {
      return '❌ Rejected';
    }
    return enrollment.status || 'Enrolled';
  }

  getStatusClass(enrollment: any): string {
    if (enrollment.grade != null || enrollment.isCompleted || enrollment.completionStatus === 'Completed') {
      return 'completed';
    }
    if (enrollment.status === 'Approved' || enrollment.isApproved) {
      return 'approved';
    }
    if (enrollment.status === 'Pending') {
      return 'pending';
    }
    if (enrollment.status === 'Rejected') {
      return 'rejected';
    }
    return 'default';
  }

  ngOnInit() {
    this.store.loadEnrollments();
    this.fetchProgress();
  }

  fetchProgress() {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<StudentProgressData>('/api/students/me').subscribe({
      next: (data) => {
        this.progressData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to load /api/students/me, using fallback profile', err);
        this.isLoading.set(false);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
