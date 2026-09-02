import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CourseCardComponent } from './course-card.component';

describe('CourseCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should display the course title', () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput('course', {
      id: 1,
      code: 'CSE-101',
      title: 'Advanced Web Dev',
      maxCapacity: 30,
      enrollmentCount: 12,
    });

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Advanced Web Dev');
  });

  it('should emit enrollClicked event when button is clicked', () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput('course', {
      id: 1,
      code: 'CSE-101',
      title: 'Advanced Web Dev',
      maxCapacity: 30,
      enrollmentCount: 12,
    });

    const component = fixture.componentInstance;
    fixture.detectChanges();

    let emittedCourse: any = null;
    component.enrollClicked.subscribe((c: any) => (emittedCourse = c));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(emittedCourse).toBeTruthy();
    expect(emittedCourse.title).toBe('Advanced Web Dev');
  });
});
