import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificateService } from '../../services/certificate.service';
import { CertificateResponseDto } from '../../models/certificate.model';

@Component({
  selector: 'app-issue-certificate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './issue-certificate.component.html',
  styleUrls: ['./issue-certificate.component.scss']
})
export class IssueCertificateComponent {
  certificateForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  issuedCertificate: CertificateResponseDto | null = null;

  constructor(private fb: FormBuilder, private certificateService: CertificateService) {
    this.certificateForm = this.fb.group({
      studentId: [null, [Validators.required, Validators.min(1)]],
      courseId: [null, [Validators.required, Validators.min(1)]],
      serialNumber: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onSubmit(): void {
    if (this.certificateForm.invalid) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.certificateService.issueCertificate(this.certificateForm.value).subscribe({
      next: (response) => {
        this.issuedCertificate = response;
        this.successMessage = `Certificate successfully issued for ${response.studentName}!`;
        this.certificateForm.reset();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Failed to issue certificate. Ensure IDs are valid and unique.';
      }
    });
  }
}