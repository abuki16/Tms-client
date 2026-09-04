import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { 
  Course, 
  CourseDetail, 
  PagedResponse 
} from '../../models/course.model';

export interface InstructorOption {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'tms-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.scss'
})
export class CourseManagementComponent implements OnInit {
  private courseService = inject(CourseService);
  public authService = inject(AuthService);
  private http = inject(HttpClient);

  // Data & Pagination Signals
  courses = signal<Course[]>([]);
  instructors = signal<InstructorOption[]>([]);
  totalCount = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(50);
  searchQuery = signal<string>('');
  
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Modal States
  showCreateModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showDetailsModal = signal<boolean>(false);

  // Form State & Selection
  newCourse = { code: '', title: '', maxCapacity: 30, instructorId: '' };
  selectedCourseId: number | null = null;
  editCourseData = { code: '', title: '', maxCapacity: 30, instructorId: '' };
  selectedCourseDetails = signal<CourseDetail | null>(null);

  ngOnInit() {
    this.loadCourses();
    this.loadInstructors();
  }

  loadInstructors() {
    this.http.get<any[]>('/api/v1/auth/users').subscribe({
      next: (users) => {
        const instrs = (users || [])
          .filter(u => u.role === 'Instructor' || (u.roles && u.roles.includes('Instructor')))
          .map(u => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName || u.email,
            email: u.email
          }));
        this.instructors.set(instrs);
      },
      error: (err) => console.warn('Failed to load instructors list', err)
    });
  }

  getInstructorName(instructorId?: string | null): string {
    if (!instructorId) return '';
    const inst = this.instructors().find(i => i.id === instructorId);
    return inst ? inst.name : 'Assigned Instructor';
  }

  assignInstructor(courseId: number, instructorId: string) {
    this.http.post(`/api/courses/${courseId}/assign-instructor`, { instructorId: instructorId || null }).subscribe({
      next: () => {
        this.triggerSuccess('Instructor assignment updated successfully.');
        this.loadCourses();
      },
      error: () => this.errorMessage.set('Failed to assign instructor to course.')
    });
  }

  loadCourses() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.courseService.getAll(this.currentPage(), this.pageSize()).subscribe({
      next: (response: PagedResponse<Course>) => {
        // Backend handles search, but apply fallback or assign items directly
        const items = response.items || [];
        const query = this.searchQuery().toLowerCase();
        
        const filtered = query 
          ? items.filter(c => c.title.toLowerCase().includes(query) || c.code.toLowerCase().includes(query))
          : items;

        this.courses.set(filtered);
        this.totalCount.set(response.totalCount || filtered.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to retrieve course catalog from the server.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
    this.loadCourses();
  }

  changePage(page: number) {
    const totalPages = Math.ceil(this.totalCount() / this.pageSize());
    if (page < 1 || (totalPages > 0 && page > totalPages)) return;
    this.currentPage.set(page);
    this.loadCourses();
  }

  // --- Create Modal & Action ---
  openCreateModal() {
    this.newCourse = { code: '', title: '', maxCapacity: 30, instructorId: '' };
    this.showCreateModal.set(true);
  }

  createCourse() {
    this.courseService.create({
      code: this.newCourse.code,
      title: this.newCourse.title,
      maxCapacity: this.newCourse.maxCapacity
    }).subscribe({
      next: (created) => {
        if (this.newCourse.instructorId && created?.id) {
          this.assignInstructor(created.id, this.newCourse.instructorId);
        }
        this.showCreateModal.set(false);
        this.triggerSuccess('Course successfully created.');
        this.loadCourses();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to create course. Ensure the course code follows format (e.g., CSE-101, AI-101) and is unique.');
      }
    });
  }

  // --- Edit Modal & Action ---
  openEditModal(course: Course) {
    this.selectedCourseId = course.id;
    this.editCourseData = {
      code: course.code,
      title: course.title,
      maxCapacity: course.maxCapacity,
      instructorId: course.instructorId || ''
    };
    this.showEditModal.set(true);
  }

  updateCourse() {
    if (this.selectedCourseId === null) return;

    this.courseService.update(this.selectedCourseId, {
      code: this.editCourseData.code,
      title: this.editCourseData.title,
      maxCapacity: this.editCourseData.maxCapacity
    }).subscribe({
      next: () => {
        if (this.editCourseData.instructorId !== undefined) {
          this.assignInstructor(this.selectedCourseId!, this.editCourseData.instructorId);
        }
        this.showEditModal.set(false);
        this.triggerSuccess('Course updated successfully.');
        this.loadCourses();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to update course.');
      }
    });
  }

  // --- Details Modal & HATEOAS View ---
  viewDetails(id: number) {
    this.courseService.getById(id.toString()).subscribe({
      next: (details) => {
        this.selectedCourseDetails.set(details);
        this.showDetailsModal.set(true);
      },
      error: () => this.errorMessage.set('Could not fetch course details and HATEOAS links.')
    });
  }

  // --- Delete Action ---
  deleteCourse(id: number, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    this.courseService.delete(id).subscribe({
      next: () => {
        this.triggerSuccess('Course deleted successfully.');
        this.loadCourses();
      },
      error: () => this.errorMessage.set('Failed to delete course. It may have active student enrollments.')
    });
  }

  private triggerSuccess(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}