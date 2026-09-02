import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCourseListComponent } from './admin-course-list.component';

describe('AdminCourseListComponent', () => {
  let component: AdminCourseListComponent;
  let fixture: ComponentFixture<AdminCourseListComponent>;

  // 1. Mark beforeEach as async and await compileComponents()
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCourseListComponent],
    }).compileComponents(); // This compiles the external templateUrl & styleUrl

    fixture = TestBed.createComponent(AdminCourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});