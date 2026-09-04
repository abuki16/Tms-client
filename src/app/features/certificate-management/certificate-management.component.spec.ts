import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { CertificateManagementComponent } from './certificate-management.component';

describe('CertificateManagementComponent', () => {
  let component: CertificateManagementComponent;
  let fixture: ComponentFixture<CertificateManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateManagementComponent],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate standard serial number when student is selected', () => {
    component.students.set([
      { id: 42, name: 'Abebe Kebede', registrationNumber: 'TMS-2026-0042', gpa: 3.9 }
    ]);

    component.onSelectStudent(42);

    expect(component.selectedStudent()?.name).toBe('Abebe Kebede');
    expect(component.newCert.studentId).toBe(42);
    expect(component.newCert.serialNumber).toContain('CERT-2026-TMS20260042');
  });

  it('should not allow certificate issue if student has no submitted grade', () => {
    component.newCert.studentId = 1;
    component.newCert.courseId = 101;
    component.selectedCourseId.set(101);
    component.newCert.serialNumber = 'CERT-2026-TEST';
    component.studentEnrollments.set([
      { id: 1, studentId: 1, courseId: 101, status: 'Approved', grade: null }
    ]);

    expect(component.isEligibleForCertificate()).toBe(false);

    component.onIssueCertificate();
    expect(component.errorMessage).toContain('has not completed this course with a submitted grade');
  });

  it('should allow certificate issue if student has completed course with a submitted grade', () => {
    component.newCert.studentId = 1;
    component.newCert.courseId = 101;
    component.selectedCourseId.set(101);
    component.newCert.serialNumber = 'CERT-2026-TEST';
    component.studentEnrollments.set([
      { id: 1, studentId: 1, courseId: 101, status: 'Approved', grade: 3.85 }
    ]);

    expect(component.isEligibleForCertificate()).toBe(true);
  });
});
