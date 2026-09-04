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

  it('should disable the enroll button and show already enrolled message when isEnrolled is true', () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput('course', {
      id: 1,
      code: 'AI-101',
      title: 'Applied Machine Learning',
      maxCapacity: 20,
      enrollmentCount: 5,
    });
    fixture.componentRef.setInput('isEnrolled', true);
    fixture.componentRef.setInput('enrollmentStatus', 'Approved');

    const component = fixture.componentInstance;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Already Enrolled');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('You are already enrolled in this course');

    let emitted = false;
    component.enrollClicked.subscribe(() => (emitted = true));
    button.click();
    expect(emitted).toBe(false);
  });

  it('should show pending review banner when isEnrolled is true and status is Pending', () => {
    const fixture = TestBed.createComponent(CourseCardComponent);
    fixture.componentRef.setInput('course', {
      id: 2,
      code: 'UX-101',
      title: 'UX Research and Wireframing',
      maxCapacity: 24,
      enrollmentCount: 3,
    });
    fixture.componentRef.setInput('isEnrolled', true);
    fixture.componentRef.setInput('enrollmentStatus', 'Pending');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Requested');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Enrollment pending administrator review');
  });
});
