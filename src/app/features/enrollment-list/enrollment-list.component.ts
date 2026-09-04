import { Component, viewChild, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { EnrollmentStore } from '../../store/enrollment.store';
import { Enrollment } from '../../models/enrollment.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'tms-enrollment-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule
  ],
  templateUrl: './enrollment-list.component.html',
  styleUrl: './enrollment-list.component.scss'
})
export class EnrollmentListComponent {
  store = inject(EnrollmentStore);
  public authService = inject(AuthService);
  private http = inject(HttpClient);

  displayedColumns = ['studentName', 'courseName', 'status', 'grade', 'actions'];

  // MatTableDataSource bridges our store data into Material's rendering pipeline
  dataSource = new MatTableDataSource<Enrollment>();

  // Grade edit state
  editingEnrollmentId = signal<number | null>(null);
  editingGradeValue = 3.5;
  isUpdatingGrade = signal(false);
  gradeMessage = signal<{ text: string; isError: boolean } | null>(null);

  // viewChild.required() is the modern signal-based replacement for @ViewChild.
  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.entities();
    });

    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });

    // Load enrollments on component creation
    this.store.loadEnrollments();
  }

  startEditGrade(enrollment: Enrollment) {
    this.editingEnrollmentId.set(Number(enrollment.id));
    this.editingGradeValue = enrollment.grade ?? 3.5;
    this.gradeMessage.set(null);
  }

  cancelEditGrade() {
    this.editingEnrollmentId.set(null);
    this.gradeMessage.set(null);
  }

  saveGrade(enrollment: Enrollment) {
    if (this.editingGradeValue < 0 || this.editingGradeValue > 4.0) {
      this.gradeMessage.set({ text: 'Grade must be between 0.00 and 4.00.', isError: true });
      return;
    }

    this.isUpdatingGrade.set(true);
    const newGrade = Math.round(this.editingGradeValue * 100) / 100;

    this.http.put(`/api/grades/enrollments/${enrollment.id}`, { grade: newGrade }).subscribe({
      next: () => {
        this.isUpdatingGrade.set(false);
        enrollment.grade = newGrade;
        this.editingEnrollmentId.set(null);
        this.gradeMessage.set({
          text: `Grade updated to ${newGrade.toFixed(2)} for ${enrollment.studentName || 'student'}.`,
          isError: false
        });
        // Reload enrollments to sync store
        this.store.loadEnrollments();
      },
      error: (err) => {
        this.isUpdatingGrade.set(false);
        this.gradeMessage.set({
          text: err.error?.message || 'Failed to update grade.',
          isError: true
        });
      }
    });
  }
}