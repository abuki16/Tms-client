import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificateService } from '../services/certificate.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ],
  template: `
    <div class="container mt-4">
      <h2>📜 Certificate Governance</h2>
      <p class="text-muted">Issue new academic credentials or revoke active certificates.</p>

      <!-- Issue Form -->
      <div class="card p-4 mb-4 shadow-sm">
        <h4>Issue New Certificate</h4>
        <form [formGroup]="certForm" (ngSubmit)="issueCertificate()">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Student ID</label>
              <input 
                type="number" 
                formControlName="studentId" 
                class="form-control" 
              />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Course ID</label>
              <input 
                type="number" 
                formControlName="courseId" 
                class="form-control" 
              />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Serial Number</label>
              <input 
                type="text" 
                formControlName="serialNumber" 
                class="form-control" 
                placeholder="CERT-2026-XXX" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            [disabled]="certForm.invalid" 
            class="btn btn-primary"
          >
            Issue Certificate
          </button>
        </form>
      </div>
    </div>
  `
})
export class AdminCertificatesComponent {
  private fb = inject(FormBuilder);
  private certService = inject(CertificateService);
  private toast = inject(ToastService);

  certForm: FormGroup = this.fb.group({
    studentId: [null, [Validators.required, Validators.min(1)]],
    courseId: [null, [Validators.required, Validators.min(1)]],
    serialNumber: ['', Validators.required]
  });

  issueCertificate() {
    if (this.certForm.invalid) {
      this.toast.warning('Please complete all required fields.');
      return;
    }

    this.certService.issueCertificate(this.certForm.value).subscribe({
      next: (res) => {
        this.toast.success(
          `Successfully issued certificate for ${res.studentName} (${res.courseTitle})!`
        );
        this.certForm.reset();
      },
      error: (err) => {
        const msg = err.error?.detail || 
                    err.error?.message || 
                    'Failed to issue certificate. Check IDs or duplicates.';
        this.toast.error(msg);
      }
    });
  }
}