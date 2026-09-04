import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { StudentProgressComponent } from './student-progress.component';

describe('StudentProgressComponent', () => {
  let component: StudentProgressComponent;
  let fixture: ComponentFixture<StudentProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentProgressComponent],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProgressComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute graduation status properly based on credits', () => {
    expect(component.graduationStatus()).toBe('In Progress');
  });
});
