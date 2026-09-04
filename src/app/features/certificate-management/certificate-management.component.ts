import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface StudentOption {
  id: number;
  name: string;
  registrationNumber?: string;
  gpa?: number;
  age?: number;
}

export interface CourseOption {
  id: number;
  code?: string;
  title: string;
  maxCapacity?: number;
}

export interface IssueCertificateRequest {
  studentId: number;
  courseId: number;
  serialNumber: string;
  grade?: number;
}

export interface CertificateResponseDto {
  id: number;
  serialNumber: string;
  issuedAt: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  gpa?: number;
  grade?: number;
  links?: any[];
}

@Component({
  selector: 'tms-certificate-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './certificate-management.component.html',
  styleUrl: './certificate-management.component.scss'
})
export class CertificateManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private baseUrl = '/api/Certificates';

  // State signals
  students = signal<StudentOption[]>([]);
  courses = signal<CourseOption[]>([]);
  selectedStudent = signal<StudentOption | null>(null);
  selectedCourse = signal<CourseOption | null>(null);
  studentCertificates = signal<CertificateResponseDto[]>([]);
  studentEnrollments = signal<any[]>([]);

  isLoadingStudents = signal(false);
  isLoadingCourses = signal(false);
  isIssuing = signal(false);

  selectedStudentId = signal<number>(0);
  selectedCourseId = signal<number>(0);

  // Selected enrollment for the currently chosen student & course
  selectedEnrollment = computed(() => {
    const list = this.studentEnrollments();
    const cId = this.selectedCourseId() || Number(this.newCert.courseId);
    if (!cId) return null;
    return list.find(e => Number(e.courseId) === cId) || null;
  });

  editingGradeValue: number | null = null;
  isSavingGrade = signal(false);
  gradeSaveSuccess = signal(false);

  // Dynamically calculate the student's cumulative GPA strictly from their finished graded courses!
  studentFinishedCoursesCount = computed(() => {
    return this.studentEnrollments().filter(e => e.grade !== null && e.grade !== undefined && Number(e.grade) >= 2.0).length;
  });

  studentCumulativeGpa = computed(() => {
    const graded = this.studentEnrollments().filter(e => e.grade !== null && e.grade !== undefined && Number(e.grade) > 0);
    if (graded.length === 0) return 0;
    const avg = graded.reduce((sum, e) => sum + Number(e.grade), 0) / graded.length;
    return Math.round(avg * 100) / 100;
  });

  // Certificate can only be issued if the student completed the course with a submitted passing grade (>= 2.00)
  isEligibleForCertificate = computed(() => {
    const enroll = this.selectedEnrollment();
    if (!enroll) return false;
    const g = this.editingGradeValue !== null ? Number(this.editingGradeValue) : (enroll.grade !== null && enroll.grade !== undefined ? Number(enroll.grade) : null);
    return g !== null && g >= 2.00;
  });

  // Check if certificate already issued for this student & course
  isAlreadyIssued = computed(() => {
    const sId = this.selectedStudentId() || Number(this.newCert.studentId);
    const cId = this.selectedCourseId() || Number(this.newCert.courseId);
    if (!sId || !cId) return false;
    return this.studentCertificates().some(c => Number(c.courseId) === cId && Number(c.studentId) === sId);
  });

  getLetterGrade(gradePoint: number | null | undefined): string {
    if (gradePoint === null || gradePoint === undefined) return '—';
    const gp = Number(gradePoint);
    if (gp >= 4.00) return 'A+ / A';
    if (gp >= 3.75) return 'A-';
    if (gp >= 3.50) return 'B+';
    if (gp >= 3.00) return 'B';
    if (gp >= 2.75) return 'B-';
    if (gp >= 2.50) return 'C+';
    if (gp >= 2.00) return 'C';
    return 'Fail';
  }

  saveAdminGrade() {
    const enroll = this.selectedEnrollment();
    if (!enroll) {
      this.errorMessage = 'No active enrollment record found for this course.';
      return;
    }
    if (this.editingGradeValue === null || isNaN(Number(this.editingGradeValue)) || Number(this.editingGradeValue) < 0 || Number(this.editingGradeValue) > 4.0) {
      this.errorMessage = 'Invalid grade: Grade must be between 0.00 and 4.00.';
      return;
    }

    this.isSavingGrade.set(true);
    this.errorMessage = '';
    const newGrade = Math.round(Number(this.editingGradeValue) * 100) / 100;

    this.http.put(`/api/grades/enrollments/${enroll.id}`, { grade: newGrade }).subscribe({
      next: () => {
        this.isSavingGrade.set(false);
        enroll.grade = newGrade;
        this.gradeSaveSuccess.set(true);
        this.successMessage = `Grade successfully verified and updated to ${newGrade.toFixed(2)} (${this.getLetterGrade(newGrade)})!`;
      },
      error: (err) => {
        this.isSavingGrade.set(false);
        this.errorMessage = err.error?.detail || err.error?.message || 'Failed to update grade.';
      }
    });
  }

  // Certificate Preview Modal
  previewCertificate = signal<CertificateResponseDto | null>(null);
  showPreviewModal = signal(false);

  // Issue Form Model
  newCert: IssueCertificateRequest = {
    studentId: 0,
    courseId: 0,
    serialNumber: ''
  };

  // Lookup Form Model
  searchStudentId: number | null = null;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadStudents();
    this.loadCourses();

    // Check query params if navigated from admin dashboard or enrollment list
    this.route.queryParams.subscribe(params => {
      if (params['studentId']) {
        const sId = Number(params['studentId']);
        this.onSelectStudent(sId);
      }
      if (params['courseId']) {
        const cId = Number(params['courseId']);
        this.newCert.courseId = cId;
        this.onSelectCourse(cId);
      }
    });
  }

  loadStudents() {
    this.isLoadingStudents.set(true);
    this.http.get<StudentOption[]>('/api/students').subscribe({
      next: (data) => {
        this.students.set(data || []);
        this.isLoadingStudents.set(false);
      },
      error: (err) => {
        console.warn('Failed to load students list', err);
        this.isLoadingStudents.set(false);
      }
    });
  }

  loadCourses() {
    this.isLoadingCourses.set(true);
    this.http.get<any>('/api/courses?pageSize=100').subscribe({
      next: (res) => {
        const items = res?.items ? res.items : (Array.isArray(res) ? res : []);
        this.courses.set(items);
        this.isLoadingCourses.set(false);
      },
      error: (err) => {
        console.warn('Failed to load courses list', err);
        this.isLoadingCourses.set(false);
      }
    });
  }

  onSelectStudent(studentIdVal: any) {
    const sId = Number(studentIdVal);
    this.selectedStudentId.set(sId);
    if (!sId) {
      this.selectedStudent.set(null);
      this.newCert.studentId = 0;
      this.newCert.serialNumber = '';
      this.studentEnrollments.set([]);
      return;
    }

    const found = this.students().find(s => s.id === sId);
    this.selectedStudent.set(found || null);
    this.newCert.studentId = sId;
    this.searchStudentId = sId;

    // Automatically generate unique standardized serial number
    this.generateSerialNumber(found, sId);

    // Fetch this student's enrollments to suggest matching courses
    this.http.get<any[]>('/api/v2/enrollments').subscribe({
      next: (allEnrollments) => {
        const studentEnrolls = (allEnrollments || []).filter((e: any) => Number(e.studentId) === sId);
        this.studentEnrollments.set(studentEnrolls);
        // If they have an enrollment and no course is selected yet, preselect first enrolled course
        if (studentEnrolls.length > 0 && (!this.newCert.courseId || this.newCert.courseId === 0)) {
          this.newCert.courseId = studentEnrolls[0].courseId;
          this.onSelectCourse(this.newCert.courseId);
        }
      },
      error: (err) => {
        console.warn('Failed to fetch enrollments for student', err);
      }
    });

    // Also auto-lookup their issued certificates
    this.onSearchStudentCertificates();
  }

  generateSerialNumber(student?: StudentOption | null, fallbackId?: number) {
    const reg = student?.registrationNumber || `TMS-2026-${fallbackId || this.newCert.studentId || 1}`;
    const cleanReg = reg.replace(/[^A-Za-z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.newCert.serialNumber = `CERT-2026-${cleanReg}-${randomSuffix}`;
  }

  onSelectCourse(courseIdVal: any) {
    const cId = Number(courseIdVal);
    this.newCert.courseId = cId;
    this.selectedCourseId.set(cId);
    const found = this.courses().find(c => c.id === cId);
    this.selectedCourse.set(found || null);
    this.errorMessage = '';
    this.successMessage = '';
    this.gradeSaveSuccess.set(false);

    const enroll = this.selectedEnrollment();
    if (enroll && enroll.grade !== null && enroll.grade !== undefined) {
      this.editingGradeValue = Number(enroll.grade);
    } else {
      this.editingGradeValue = null;
    }
  }

  onIssueCertificate() {
    if (!this.newCert.studentId || this.newCert.studentId <= 0) {
      this.errorMessage = 'Please select a valid student.';
      return;
    }
    if (!this.newCert.courseId || this.newCert.courseId <= 0) {
      this.errorMessage = 'Please select a course for the certificate.';
      return;
    }
    if (!this.newCert.serialNumber?.trim()) {
      this.errorMessage = 'Serial number is required.';
      return;
    }

    if (this.isAlreadyIssued()) {
      this.errorMessage = 'A certificate has already been issued to this student for this course.';
      return;
    }

    // Strict validation: Verify student has finished the course with a submitted grade
    const enroll = this.studentEnrollments().find(e => Number(e.courseId) === Number(this.newCert.courseId));
    if (!enroll) {
      this.errorMessage = 'Certificate cannot be generated: The selected student is not enrolled in this course.';
      return;
    }

    const currentGrade = this.editingGradeValue !== null ? Number(this.editingGradeValue) : (enroll.grade !== null && enroll.grade !== undefined ? Number(enroll.grade) : null);
    if (currentGrade === null || isNaN(currentGrade)) {
      this.errorMessage = 'Certificate cannot be generated: The student has not completed this course with a submitted grade. The instructor must submit a grade before an official certificate can be issued.';
      return;
    }
    if (currentGrade < 2.00) {
      this.errorMessage = 'Certificate cannot be generated: The student has not completed this course with a passing submitted grade (minimum 2.00 / C).';
      return;
    }

    this.newCert.grade = currentGrade;
    this.isIssuing.set(true);
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<CertificateResponseDto>(this.baseUrl, this.newCert).subscribe({
      next: (res) => {
        this.isIssuing.set(false);
        this.successMessage = `Certificate successfully issued for ${res.studentName || this.selectedStudent()?.name || 'Student'}! Serial: ${res.serialNumber}`;
        this.errorMessage = '';
        this.previewCertificate.set(res);
        this.showPreviewModal.set(true);

        // Refresh lookup list
        this.onSearchStudentCertificates();

        // Regenerate new serial for next issuance
        this.generateSerialNumber(this.selectedStudent(), this.newCert.studentId);
      },
      error: (err) => {
        this.isIssuing.set(false);
        this.errorMessage = err.error?.detail || err.error?.message || (typeof err.error === 'string' ? err.error : 'Failed to issue certificate. Verify that the student and course IDs exist, and ensure unique serial number.');
        this.successMessage = '';
      }
    });
  }

  onSearchStudentCertificates() {
    if (!this.searchStudentId) return;

    this.http.get<CertificateResponseDto[]>(`${this.baseUrl}/student/${this.searchStudentId}`).subscribe({
      next: (data) => {
        this.studentCertificates.set(data || []);
        this.errorMessage = '';
      },
      error: () => {
        this.studentCertificates.set([]);
      }
    });
  }

  onRevoke(id: number) {
    if (!confirm('Are you sure you want to permanently revoke this certificate?')) return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.successMessage = `Certificate #${id} revoked successfully.`;
        if (this.searchStudentId) {
          this.onSearchStudentCertificates();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to revoke the certificate.';
      }
    });
  }

  openPreview(cert: CertificateResponseDto) {
    this.previewCertificate.set(cert);
    this.showPreviewModal.set(true);
  }

  closePreview() {
    this.showPreviewModal.set(false);
  }

  printCertificate() {
    window.print();
  }
}