import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { 
  Course, 
  CourseDetail, 
  PagedResponse 
} from '../../models/course.model';

@Component({
  selector: 'tms-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.scss'
})
export class CourseManagementComponent implements OnInit {
  private courseService = inject(CourseService);

  // Data & Pagination Signals
  courses = signal<Course[]>([]);
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
  newCourse = { code: '', title: '', maxCapacity: 30 };
  selectedCourseId: number | null = null;
  editCourseData = { code: '', title: '', maxCapacity: 30 };
  selectedCourseDetails = signal<CourseDetail | null>(null);

  ngOnInit() {
    this.loadCourses();
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
    this.newCourse = { code: '', title: '', maxCapacity: 30 };
    this.showCreateModal.set(true);
  }

  createCourse() {
    this.courseService.create(this.newCourse).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.triggerSuccess('Course successfully created.');
        this.loadCourses();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to create course. Ensure the course code follows format XXX-000 and is unique.');
      }
    });
  }

  // --- Edit Modal & Action ---
  openEditModal(course: Course) {
    this.selectedCourseId = course.id;
    this.editCourseData = {
      code: course.code,
      title: course.title,
      maxCapacity: course.maxCapacity
    };
    this.showEditModal.set(true);
  }

  updateCourse() {
    if (this.selectedCourseId === null) return;

    this.courseService.update(this.selectedCourseId, this.editCourseData).subscribe({
      next: () => {
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