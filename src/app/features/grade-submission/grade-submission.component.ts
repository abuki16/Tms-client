import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { 
  AssessmentResponseDto, 
  AssessmentResultResponseDto, 
  CreateAssessmentRequest, 
  GradeStudentRequest 
} from '../../models/assessment.model';

@Component({
  selector: 'tms-grade-submission',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink
  ],
  templateUrl: './grade-submission.component.html',
  styleUrl: './grade-submission.component.scss'
})
export class GradeSubmissionComponent implements OnInit {
  private assessmentService = inject(AssessmentService);
  private toast = inject(ToastService);
  public authService = inject(AuthService);

  assignedCourseId: number = 1; 
  selectedAssessmentId: number | null = null;

  assessments = signal<AssessmentResponseDto[]>([]);
  results = signal<AssessmentResultResponseDto[]>([]);
  
  newAssessment: CreateAssessmentRequest = { 
    title: '', 
    maxScore: 100, 
    weight: 0.30 
  };

  newGrade: GradeStudentRequest = { 
    title: '', 
    scoreObtained: 0, 
    weight: 0.30, 
    studentId: 0 
  };

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.assessmentService.getAssessmentsByCourse(this.assignedCourseId).subscribe({
      next: (data) => this.assessments.set(data),
      error: () => this.assessments.set([])
    });
  }

  loadResults() {
    if (!this.selectedAssessmentId) return;
    this.assessmentService.getResultsByAssessment(Number(this.selectedAssessmentId)).subscribe({
      next: (data) => this.results.set(data),
      error: () => this.results.set([])
    });
  }

  onCreateAssessment() {
    this.assessmentService.createAssessment(this.assignedCourseId, this.newAssessment).subscribe({
      next: () => {
        this.toast.success('Assessment definition created successfully!');
        this.newAssessment = { 
          title: '', 
          maxScore: 100, 
          weight: 0.30 
        };
        this.loadAssessments();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Failed to create assessment definition.');
      }
    });
  }

  onGradeStudent() {
    if (!this.selectedAssessmentId) return;
    this.assessmentService.gradeStudent(this.selectedAssessmentId, this.newGrade).subscribe({
      next: () => {
        this.toast.success('Student graded successfully!');
        this.newGrade = { 
          title: '', 
          scoreObtained: 0, 
          weight: 0.30, 
          studentId: 0 
        };
        this.loadResults();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || err.error?.message || 'Failed to save grade record.');
      }
    });
  }

  updateScore(res: AssessmentResultResponseDto) {
    if (!this.selectedAssessmentId) return;
    this.assessmentService.updateStudentScore(
      this.selectedAssessmentId, 
      res.id, 
      res.scoreObtained
    ).subscribe({
      next: () => this.toast.success('Score updated successfully!'),
      error: (err) => this.toast.error(err.error?.detail || 'Failed to update score.')
    });
  }

  deleteResult(resultId: number) {
    if (!this.selectedAssessmentId || !confirm('Are you sure you want to delete this grade record?')) return;
    this.assessmentService.deleteResult(this.selectedAssessmentId, resultId).subscribe({
      next: () => {
        this.results.update(list => list.filter(r => r.id !== resultId));
        this.toast.success('Grade record deleted.');
      },
      error: (err) => this.toast.error(err.error?.detail || 'Failed to delete record.')
    });
  }
}