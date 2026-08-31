import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificateService } from '../services/certificate.service';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
              <!-- Fixed: Added opening <input> tag -->
              <input type="number" formControlName="studentId" class="form-control" />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Course ID</label>
              <input type="number" formControlName="courseId" class="form-control" />
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Serial Number</label>
              <input type="text" formControlName="serialNumber" class="form-control" placeholder="CERT-2026-XXX" />
            </div>
          </div>
          <button type="submit" [disabled]="certForm.invalid" class="btn btn-primary">Issue Certificate</button>
        </form>

        <!-- Dynamically changes alert styling based on success or failure -->
        <div *ngIf="message" [class]="isError ? 'alert alert-danger mt-3' : 'alert alert-success mt-3'">
          {{ message }}
        </div>
      </div>
    </div>
  `
})
export class AdminCertificatesComponent {
  certForm: FormGroup;
  message: string = '';
  isError: boolean = false;

  constructor(private fb: FormBuilder, private certService: CertificateService) {
    this.certForm = this.fb.group({
      studentId: [null, [Validators.required, Validators.min(1)]],
      courseId: [null, [Validators.required, Validators.min(1)]],
      serialNumber: ['', Validators.required]
    });
  }

  issueCertificate() {
    if (this.certForm.invalid) return;

    this.certService.issueCertificate(this.certForm.value).subscribe({
      next: (res) => {
        this.isError = false;
        this.message = `Successfully issued certificate for ${res.studentName} (${res.courseTitle})!`;
        this.certForm.reset();
      },
      error: (err) => {
        this.isError = true;
        // Extracts the exact message sent from your C# backend (e.g. duplicate or not found)
        this.message = err.error?.message || 'Failed to issue certificate. Check IDs or duplicates.';
      }
    });
  }
}