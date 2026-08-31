import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueCertificateComponent } from './issue-certificate.component';

describe('IssueCertificateComponent', () => {
  let component: IssueCertificateComponent;
  let fixture: ComponentFixture<IssueCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueCertificateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueCertificateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
