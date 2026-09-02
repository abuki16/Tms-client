import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RegistrarDashboardComponent } from './registrar-dashboard.component';

describe('RegistrarDashboardComponent', () => {
  let component: RegistrarDashboardComponent;
  let fixture: ComponentFixture<RegistrarDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarDashboardComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
