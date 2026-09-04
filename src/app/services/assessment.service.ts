import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AssessmentResponseDto, 
  AssessmentResultResponseDto, 
  CreateAssessmentRequest, 
  GradeStudentRequest 
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private http = inject(HttpClient);
  private baseUrl = '/api';

  // --- Assessment Definitions ---
  getAssessmentsByCourse(courseId: number): Observable<AssessmentResponseDto[]> {
    return this.http.get<AssessmentResponseDto[]>(`${this.baseUrl}/courses/${courseId}/assessments`);
  }

  createAssessment(courseId: number, dto: CreateAssessmentRequest): Observable<AssessmentResponseDto> {
    return this.http.post<AssessmentResponseDto>(`${this.baseUrl}/courses/${courseId}/assessments`, dto);
  }

  deleteAssessment(courseId: number, assessmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/courses/${courseId}/assessments/${assessmentId}`);
  }

  // --- Assessment Results (Grading) ---
  getResultsByAssessment(assessmentId: number): Observable<AssessmentResultResponseDto[]> {
    return this.http.get<AssessmentResultResponseDto[]>(`${this.baseUrl}/assessments/${assessmentId}/results`);
  }

  gradeStudent(assessmentId: number, dto: GradeStudentRequest): Observable<AssessmentResultResponseDto> {
    return this.http.post<AssessmentResultResponseDto>(`${this.baseUrl}/assessments/${assessmentId}/results`, dto);
  }

  updateStudentScore(assessmentId: number, resultId: number, scoreObtained: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/assessments/${assessmentId}/results/${resultId}/score`, { scoreObtained });
  }

  deleteResult(assessmentId: number, resultId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/assessments/${assessmentId}/results/${resultId}`);
  }
}