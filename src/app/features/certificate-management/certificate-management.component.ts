import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
export class CertificateManagementComponent {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5049/api/Certificates';

  // Issue Form Model
  newCert: IssueCertificateRequest = {
    studentId: 0,
    courseId: 0,
    serialNumber: ''
  };

  // Lookup Form Model
  searchStudentId: number | null = null;
  studentCertificates = signal<CertificateResponseDto[]>([]);

  successMessage = '';
  errorMessage = '';

  // 1. Issue Certificate
  onIssueCertificate() {
    this.http.post<CertificateResponseDto>(this.baseUrl, this.newCert).subscribe({
      next: (res) => {
        this.successMessage = `Certificate successfully issued! Serial: ${res.serialNumber}`;
        this.errorMessage = '';
        this.newCert = { studentId: 0, courseId: 0, serialNumber: '' };
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to issue certificate. Verify IDs and ensure unique serial number.';
        this.successMessage = '';
      }
    });
  }

  // 2. Lookup Certificates by Student ID
  onSearchStudentCertificates() {
    if (!this.searchStudentId) return;

    this.http.get<CertificateResponseDto[]>(`${this.baseUrl}/student/${this.searchStudentId}`).subscribe({
      next: (data) => {
        this.studentCertificates.set(data);
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Could not fetch certificates for this student.';
        this.studentCertificates.set([]);
      }
    });
  }

  // 3. Revoke Certificate
  onRevoke(id: number) {
    if (!confirm('Are you sure you want to permanently revoke this certificate?')) return;

    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.successMessage = `Certificate #${id} revoked successfully.`;
        // Refresh lookup list if active
        if (this.searchStudentId) {
          this.onSearchStudentCertificates();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to revoke the certificate.';
      }
    });
  }
}