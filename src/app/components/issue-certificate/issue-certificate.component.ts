import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificateService } from '../../services/certificate.service';
import { CertificateResponseDto } from '../../models/certificate.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-issue-certificate',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  templateUrl: './issue-certificate.component.html',
  styleUrls: ['./issue-certificate.component.scss']
})
export class IssueCertificateComponent {
  private fb = inject(FormBuilder);
  private certificateService = inject(CertificateService);
  private toast = inject(ToastService);

  certificateForm: FormGroup = this.fb.group({
    studentId: [null, [Validators.required, Validators.min(1)]],
    courseId: [null, [Validators.required, Validators.min(1)]],
    serialNumber: ['', [Validators.required, Validators.minLength(3)]]
  });

  issuedCertificate: CertificateResponseDto | null = null;

  onSubmit(): void {
    if (this.certificateForm.invalid) {
      this.toast.warning('Please enter valid Student ID, Course ID, and Serial Number.');
      return;
    }

    this.certificateService.issueCertificate(this.certificateForm.value).subscribe({
      next: (response) => {
        this.issuedCertificate = response;
        this.toast.success(`Certificate successfully issued for ${response.studentName}!`);
        this.certificateForm.reset();
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 
                         err.error?.message || 
                         'Failed to issue certificate. Ensure IDs are valid and unique.';
        this.toast.error(errorMsg);
      }
    });
  }
}