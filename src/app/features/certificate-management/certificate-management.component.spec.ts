import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CertificateManagementComponent } from './certificate-management.component';

describe('CertificateManagementComponent', () => {
  let component: CertificateManagementComponent;
  let fixture: ComponentFixture<CertificateManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateManagementComponent],
      providers: [provideHttpClient()]
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
});
