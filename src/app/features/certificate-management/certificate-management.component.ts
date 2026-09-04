import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
}

export interface CertificateResponseDto {
  id: number;
  serialNumber: string;
  issuedAt: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  links?: any[];
}

@Component({
  selector: 'tms-certificate-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate-management.component.html',
  styleUrl: './certificate-management.component.scss'
})
export class CertificateManagementComponent implements OnInit {
  private http = inject(HttpClient);
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
    const found = this.courses().find(c => c.id === cId);
    this.selectedCourse.set(found || null);
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
        this.errorMessage = err.error?.message || err.error || 'Failed to issue certificate. Verify that the student and course IDs exist, and ensure unique serial number.';
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