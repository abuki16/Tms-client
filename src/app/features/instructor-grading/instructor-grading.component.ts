import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentService } from '../../services/assessment.service';
import { 
  AssessmentResponseDto, 
  AssessmentResultResponseDto, 
  CreateAssessmentRequest, 
  GradeStudentRequest 
} from '../../models/assessment.model';

@Component({
  selector: 'tms-instructor-grading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-grading.component.html',
  styleUrl: './instructor-grading.component.scss'
})
export class InstructorGradingComponent implements OnInit {
  private assessmentService = inject(AssessmentService);

  assignedCourseId: number = 1; 
  selectedAssessmentId: number | null = null;

  assessments = signal<AssessmentResponseDto[]>([]);
  results = signal<AssessmentResultResponseDto[]>([]);
  
  // Payload matching Scalar API contract exactly
  newAssessment: CreateAssessmentRequest = { title: '', maxScore: 100, weight: 0.30 };
  newGrade: GradeStudentRequest = { title: '', scoreObtained: 0, weight: 0.30, studentId: 0 };
  
  errorMessage = '';
  successMessage = '';

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

  toggleAssessment(assessmentId: number) {
    if (this.selectedAssessmentId === assessmentId) {
      this.selectedAssessmentId = null;
      this.results.set([]);
    } else {
      this.selectedAssessmentId = assessmentId;
      this.loadResults();
    }
  }

  onCreateAssessment() {
    this.assessmentService.createAssessment(this.assignedCourseId, this.newAssessment).subscribe({
      next: () => {
        this.successMessage = 'Assessment definition created successfully!';
        this.errorMessage = '';
        this.newAssessment = { title: '', maxScore: 100, weight: 0.30 };
        this.loadAssessments();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Failed to create assessment definition.';
        this.successMessage = '';
      }
    });
  }

  deleteAssessment(assessmentId: number) {
    if (!confirm('Are you sure you want to delete this assessment definition?')) return;
    this.assessmentService.deleteAssessment(this.assignedCourseId, assessmentId).subscribe({
      next: () => {
        if (this.selectedAssessmentId === assessmentId) {
          this.selectedAssessmentId = null;
          this.results.set([]);
        }
        this.loadAssessments();
      },
      error: (err) => alert(err.error?.detail || 'Failed to delete assessment.')
    });
  }

  onGradeStudent() {
    if (!this.selectedAssessmentId) return;
    this.assessmentService.gradeStudent(this.selectedAssessmentId, this.newGrade).subscribe({
      next: () => {
        this.successMessage = 'Student grade submitted successfully!';
        this.errorMessage = '';
        this.newGrade = { title: '', scoreObtained: 0, weight: 0.30, studentId: 0 };
        this.loadResults();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Failed to submit student grade.';
        this.successMessage = '';
      }
    });
  }

  updateScore(res: AssessmentResultResponseDto) {
    if (!this.selectedAssessmentId) return;
    this.assessmentService.updateStudentScore(this.selectedAssessmentId, res.id, res.scoreObtained).subscribe({
      next: () => alert('Student score updated successfully!'),
      error: (err) => alert(err.error?.detail || 'Failed to update score.')
    });
  }

  deleteResult(resultId: number) {
    if (!this.selectedAssessmentId || !confirm('Are you sure you want to delete this grade record?')) return;
    this.assessmentService.deleteResult(this.selectedAssessmentId, resultId).subscribe({
      next: () => {
        this.results.update(list => list.filter(r => r.id !== resultId));
      },
      error: (err) => alert(err.error?.detail || 'Failed to delete record.')
    });
  }
}