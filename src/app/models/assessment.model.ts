export interface AssessmentResponseDto {
  id: number;
  title: string;
  maxScore: number;
  weight: number;
  courseId: number;
}

export interface AssessmentResultResponseDto {
  id: number;
  title: string;
  scoreObtained: number;
  weight: number;
  assessmentId: number;
  studentId: number;
  studentName: string;
}

export interface CreateAssessmentRequest {
  title: string;
  maxScore: number;
  weight: number;
}

export interface GradeStudentRequest {
  title: string;
  scoreObtained: number;
  weight: number;
  studentId: number;
}

export interface UpdateAssessmentResultScoreRequest {
  scoreObtained: number;
}