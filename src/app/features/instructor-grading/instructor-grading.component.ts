import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { 
  AssessmentResponseDto, 
  AssessmentResultResponseDto, 
  CreateAssessmentRequest, 
  GradeStudentRequest 
} from '../../models/assessment.model';

export interface CourseItem {
  id: number;
  code?: string;
  title: string;
  maxCapacity?: number;
  enrollmentCount?: number;
}

export interface StudentItem {
  id: number;
  name: string;
  registrationNumber?: string;
  gpa?: number;
  age?: number;
  isActive?: boolean;
}

export interface StandardAssessmentConfig {
  title: string;
  maxScore: number;
  weight: number;
  description: string;
  badge: string;
}

export const STANDARD_ASSESSMENTS: StandardAssessmentConfig[] = [
  {
    title: 'Continuous Assessment',
    maxScore: 20,
    weight: 0.20,
    description: 'Coursework, quizzes, and continuous evaluation (Max 20 pts / 20%)',
    badge: '20%'
  },
  {
    title: 'Midterm Examination',
    maxScore: 30,
    weight: 0.30,
    description: 'Midterm comprehensive examination (Max 30 pts / 30%)',
    badge: '30%'
  },
  {
    title: 'Final Examination',
    maxScore: 50,
    weight: 0.50,
    description: 'Final semester examination (Max 50 pts / 50%)',
    badge: '50%'
  }
];

export interface GradebookRow {
  studentId: number;
  studentName: string;
  registrationNumber?: string;
  continuousScore: number | null;
  midtermScore: number | null;
  finalScore: number | null;
  enrollmentStatus?: string;
  isApproved: boolean;
  isSaving: boolean;
}

/**
 * Instructor Assessment & Grading Portal Component
 * Handles standardized 100% academic curriculum, progressive gradebook scoring,
 * and administrator approval validation locks.
 */
@Component({
  selector: 'tms-instructor-grading',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink
  ],
  templateUrl: './instructor-grading.component.html',
  styleUrl: './instructor-grading.component.scss'
})
export class InstructorGradingComponent implements OnInit {
  private assessmentService = inject(AssessmentService);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  public authService = inject(AuthService);

  readonly standardAssessments = STANDARD_ASSESSMENTS;

  // Selected Context
  selectedCourseId: number = 1;
  selectedAssessmentId: number | null = null;
  selectedStudent = signal<StudentItem | null>(null);

  // Data collections
  courses = signal<CourseItem[]>([]);
  students = signal<StudentItem[]>([]);
  courseEnrollments = signal<any[]>([]);
  assessments = signal<AssessmentResponseDto[]>([]);
  results = signal<AssessmentResultResponseDto[]>([]);

  // Gradebook matrix signal
  gradebookRows = signal<GradebookRow[]>([]);
  isLoadingGradebook = signal(false);

  // Loading States
  isLoadingCourses = signal(false);
  isLoadingStudents = signal(false);
  isLoadingAssessments = signal(false);

  // Predefined Direct Score Submission Model
  quickAssessment = {
    studentId: 0,
    assessmentIndex: 0, // 0 = Continuous Assessment (20%), 1 = Midterm (30%), 2 = Final (50%)
    scoreObtained: 0
  };

  // Custom Assessment Form Model (for optional advanced curriculum extensions)
  newAssessment: CreateAssessmentRequest = { title: '', maxScore: 100, weight: 0.30 };
  newGrade: GradeStudentRequest = { title: '', scoreObtained: 0, weight: 0.30, studentId: 0 };

  ngOnInit() {
    this.loadCourses();
    this.loadStudents();
  }

  loadCourses() {
    this.isLoadingCourses.set(true);
    this.http.get<CourseItem[]>('/api/courses/assigned').subscribe({
      next: (assigned) => {
        if (assigned && assigned.length > 0) {
          this.courses.set(assigned);
          if (!this.selectedCourseId || !assigned.some(c => c.id === this.selectedCourseId)) {
            this.selectedCourseId = assigned[0].id;
          }
          this.isLoadingCourses.set(false);
          this.onCourseChange();
        } else {
          this.http.get<any>('/api/courses?pageSize=100').subscribe({
            next: (res) => {
              const items: CourseItem[] = res?.items ? res.items : (Array.isArray(res) ? res : []);
              this.courses.set(items);
              if (items.length > 0 && (!this.selectedCourseId || !items.some(c => c.id === this.selectedCourseId))) {
                this.selectedCourseId = items[0].id;
              }
              this.isLoadingCourses.set(false);
              this.onCourseChange();
            },
            error: () => {
              this.isLoadingCourses.set(false);
              this.onCourseChange();
            }
          });
        }
      },
      error: () => {
        this.http.get<any>('/api/courses?pageSize=100').subscribe({
          next: (res) => {
            const items: CourseItem[] = res?.items ? res.items : (Array.isArray(res) ? res : []);
            this.courses.set(items);
            if (items.length > 0 && (!this.selectedCourseId || !items.some(c => c.id === this.selectedCourseId))) {
              this.selectedCourseId = items[0].id;
            }
            this.isLoadingCourses.set(false);
            this.onCourseChange();
          },
          error: () => {
            this.isLoadingCourses.set(false);
            this.onCourseChange();
          }
        });
      }
    });
  }

  loadStudents() {
    this.isLoadingStudents.set(true);
    this.http.get<StudentItem[]>('/api/students').subscribe({
      next: (data) => {
        this.students.set(data || []);
        this.isLoadingStudents.set(false);
      },
      error: (err) => {
        console.warn('Failed to load students', err);
        this.isLoadingStudents.set(false);
      }
    });
  }

  onCourseChange() {
    this.selectedAssessmentId = null;
    this.results.set([]);
    this.loadAssessments();
    this.loadCourseEnrollments();
  }

  loadAssessments() {
    this.isLoadingAssessments.set(true);
    this.assessmentService.getAssessmentsByCourse(this.selectedCourseId).subscribe({
      next: (data) => {
        this.assessments.set(data || []);
        this.isLoadingAssessments.set(false);
        this.syncGradebook();
      },
      error: () => {
        this.assessments.set([]);
        this.isLoadingAssessments.set(false);
      }
    });
  }

  loadCourseEnrollments() {
    this.http.get<any[]>(`/api/courses/${this.selectedCourseId}/enrollments`).subscribe({
      next: (data) => {
        this.courseEnrollments.set(data || []);
        this.syncGradebook();
      },
      error: () => {
        this.courseEnrollments.set([]);
        this.syncGradebook();
      }
    });
  }

  // Synchronizes the 100% Student Gradebook matrix for the active course
  syncGradebook() {
    const enrollments = this.courseEnrollments();
    const currentAssessments = this.assessments();

    if (enrollments.length === 0 || currentAssessments.length === 0) {
      const baseRows: GradebookRow[] = enrollments.map(e => {
        const isApproved = (e.status || e.Status || '').toLowerCase() === 'approved';
        const enrollmentStatus = e.status || e.Status || 'Pending';
        return {
          studentId: e.studentId,
          studentName: e.studentName || `Student #${e.studentId}`,
          registrationNumber: e.registrationNumber,
          continuousScore: null,
          midtermScore: null,
          finalScore: null,
          enrollmentStatus: enrollmentStatus,
          isApproved: isApproved,
          isSaving: false
        };
      });
      this.gradebookRows.set(baseRows);
      return;
    }

    this.isLoadingGradebook.set(true);

    const requests = currentAssessments.map(asm =>
      this.assessmentService.getResultsByAssessment(asm.id).pipe(
        catchError(() => of([] as AssessmentResultResponseDto[]))
      )
    );

    forkJoin(requests).subscribe({
      next: (allResults) => {
        const rows: GradebookRow[] = enrollments.map(e => {
          const sId = Number(e.studentId);
          const isApproved = (e.status || e.Status || '').toLowerCase() === 'approved';
          const enrollmentStatus = e.status || e.Status || 'Pending';
          let contScore: number | null = null;
          let midScore: number | null = null;
          let finScore: number | null = null;

          currentAssessments.forEach((asm, idx) => {
            const asmResults = allResults[idx] || [];
            const r = asmResults.find(res => res.studentId === sId);
            if (r) {
              const lowerTitle = asm.title.toLowerCase();
              if (lowerTitle.includes('continuous') || lowerTitle.includes('ca')) {
                contScore = r.scoreObtained;
              } else if (lowerTitle.includes('mid') || lowerTitle.includes('midterm')) {
                midScore = r.scoreObtained;
              } else if (lowerTitle.includes('final')) {
                finScore = r.scoreObtained;
              }
            }
          });

          return {
            studentId: sId,
            studentName: e.studentName || `Student #${sId}`,
            registrationNumber: e.registrationNumber,
            continuousScore: contScore,
            midtermScore: midScore,
            finalScore: finScore,
            enrollmentStatus: enrollmentStatus,
            isApproved: isApproved,
            isSaving: false
          };
        });

        this.gradebookRows.set(rows);
        this.isLoadingGradebook.set(false);
      },
      error: () => {
        this.isLoadingGradebook.set(false);
      }
    });
  }

  getTotalScore(row: GradebookRow): number {
    return (row.continuousScore || 0) + (row.midtermScore || 0) + (row.finalScore || 0);
  }

  getGradePoint(row: GradebookRow): number {
    const total = this.getTotalScore(row);
    if (total >= 85) return 4.00;
    if (total >= 80) return 3.75;
    if (total >= 75) return 3.50;
    if (total >= 70) return 3.00;
    if (total >= 60) return 2.75;
    if (total >= 55) return 2.50;
    if (total >= 50) return 2.00;
    return 0.00;
  }

  getLetterGrade(totalScore: number): string {
    if (totalScore >= 90) return 'A+';
    if (totalScore >= 85) return 'A';
    if (totalScore >= 80) return 'A-';
    if (totalScore >= 75) return 'B+';
    if (totalScore >= 70) return 'B';
    if (totalScore >= 60) return 'B-';
    if (totalScore >= 55) return 'C+';
    if (totalScore >= 50) return 'C';
    return 'Fail';
  }

  isContinuousInvalid(score: number | null | undefined): boolean {
    if (score === null || score === undefined || (score as any) === '') return false;
    const num = Number(score);
    return isNaN(num) || num < 0 || num > 20;
  }

  isMidtermInvalid(score: number | null | undefined): boolean {
    if (score === null || score === undefined || (score as any) === '') return false;
    const num = Number(score);
    return isNaN(num) || num < 0 || num > 30;
  }

  isFinalInvalid(score: number | null | undefined): boolean {
    if (score === null || score === undefined || (score as any) === '') return false;
    const num = Number(score);
    return isNaN(num) || num < 0 || num > 50;
  }

  isRowInvalid(row: GradebookRow): boolean {
    return this.isContinuousInvalid(row.continuousScore) ||
           this.isMidtermInvalid(row.midtermScore) ||
           this.isFinalInvalid(row.finalScore);
  }

  isRowApproved(row: GradebookRow): boolean {
    return !!row?.isApproved;
  }

  isQuickScoreInvalid(): boolean {
    const config = this.standardAssessments[this.quickAssessment.assessmentIndex];
    if (this.quickAssessment.scoreObtained === null || this.quickAssessment.scoreObtained === undefined || (this.quickAssessment.scoreObtained as any) === '') return false;
    const num = Number(this.quickAssessment.scoreObtained);
    return isNaN(num) || num < 0 || num > config.maxScore;
  }

  isQuickStudentApproved(): boolean {
    if (!this.quickAssessment.studentId) return true;
    const enroll = this.courseEnrollments().find(e => 
      Number(e.studentId) === this.quickAssessment.studentId
    );
    if (!enroll) return false;
    return (enroll.status || enroll.Status || '').toLowerCase() === 'approved';
  }

  getCompletedComponentsCount(row: GradebookRow): number {
    let count = 0;
    if (row.continuousScore !== null && row.continuousScore !== undefined && !this.isContinuousInvalid(row.continuousScore)) count++;
    if (row.midtermScore !== null && row.midtermScore !== undefined && !this.isMidtermInvalid(row.midtermScore)) count++;
    if (row.finalScore !== null && row.finalScore !== undefined && !this.isFinalInvalid(row.finalScore)) count++;
    return count;
  }

  // Submits marks for an individual student from the Gradebook
  saveStudentMarks(row: GradebookRow) {
    if (!row.isApproved) {
      this.toast.error(
        `Cannot grade ${row.studentName}: Student enrollment is pending Administrator approval.`
      );
      return;
    }

    if (this.isRowInvalid(row)) {
      this.toast.error(
        `Invalid score entered for ${row.studentName}. Continuous must be 0-20, Midterm 0-30, and Final Examination 0-50.`
      );
      return;
    }

    if (row.continuousScore !== null && (row.continuousScore < 0 || row.continuousScore > 20)) {
      this.toast.error(
        `Continuous Assessment score for ${row.studentName} must be between 0 and 20.`
      );
      return;
    }
    if (row.midtermScore !== null && (row.midtermScore < 0 || row.midtermScore > 30)) {
      this.toast.error(
        `Midterm Examination score for ${row.studentName} must be between 0 and 30.`
      );
      return;
    }
    if (row.finalScore !== null && (row.finalScore < 0 || row.finalScore > 50)) {
      this.toast.error(
        `Final Examination score for ${row.studentName} must be between 0 and 50.`
      );
      return;
    }

    row.isSaving = true;

    const currentAssessments = this.assessments();
    const contAsm = currentAssessments.find(a => 
      a.title.toLowerCase().includes('continuous') || a.title.toLowerCase().includes('ca')
    );
    const midAsm = currentAssessments.find(a => 
      a.title.toLowerCase().includes('mid')
    );
    const finAsm = currentAssessments.find(a => 
      a.title.toLowerCase().includes('final')
    );

    const gradingCalls = [];

    if (row.continuousScore !== null && contAsm) {
      gradingCalls.push(
        this.assessmentService.gradeStudent(contAsm.id, {
          title: contAsm.title,
          scoreObtained: Number(row.continuousScore),
          weight: contAsm.weight,
          studentId: row.studentId
        }).pipe(catchError(err => of({ error: err })))
      );
    }

    if (row.midtermScore !== null && midAsm) {
      gradingCalls.push(
        this.assessmentService.gradeStudent(midAsm.id, {
          title: midAsm.title,
          scoreObtained: Number(row.midtermScore),
          weight: midAsm.weight,
          studentId: row.studentId
        }).pipe(catchError(err => of({ error: err })))
      );
    }

    if (row.finalScore !== null && finAsm) {
      gradingCalls.push(
        this.assessmentService.gradeStudent(finAsm.id, {
          title: finAsm.title,
          scoreObtained: Number(row.finalScore),
          weight: finAsm.weight,
          studentId: row.studentId
        }).pipe(catchError(err => of({ error: err })))
      );
    }

    if (gradingCalls.length === 0) {
      row.isSaving = false;
      this.toast.warning(`Please enter at least one assessment score for ${row.studentName}.`);
      return;
    }

    forkJoin(gradingCalls).subscribe({
      next: (responses) => {
        row.isSaving = false;
        const failedResponse = responses.find(r => r && (r as any).error);
        if (failedResponse) {
          const err = (failedResponse as any).error;
          this.toast.error(
            err.error?.detail || err.error?.message || `Failed to save all marks for ${row.studentName}.`
          );
          return;
        }

        const total = this.getTotalScore(row);
        const gpa = this.getGradePoint(row);
        const letter = this.getLetterGrade(total);
        this.toast.success(
          `Scores saved for ${row.studentName}! Total: ${total}/100 (${letter}) | Grade: ${gpa.toFixed(2)}/4.00`
        );
        this.loadCourseEnrollments();
      },
      error: () => {
        row.isSaving = false;
        this.toast.error(`Failed to save all scores for ${row.studentName}.`);
      }
    });
  }

  // Quick Direct Submission using predefined selector
  onQuickAssessStudent() {
    if (!this.quickAssessment.studentId || this.quickAssessment.studentId <= 0) {
      this.toast.warning('Please select a student from the dropdown list.');
      return;
    }

    const enroll = this.courseEnrollments().find(e => 
      Number(e.studentId) === this.quickAssessment.studentId
    );

    if (!enroll || (enroll.status || enroll.Status || '').toLowerCase() !== 'approved') {
      this.toast.error(
        'Cannot grade student: Student enrollment has not been approved by an administrator.'
      );
      return;
    }

    const config = this.standardAssessments[this.quickAssessment.assessmentIndex];
    if (this.isQuickScoreInvalid()) {
      this.toast.error(
        `Invalid score: Score obtained (${this.quickAssessment.scoreObtained}) must be between 0 and ${config.maxScore} for ${config.title}.`
      );
      return;
    }

    const student = this.students().find(s => s.id === this.quickAssessment.studentId);
    let targetAsm = this.assessments().find(a => 
      a.title.toLowerCase().trim() === config.title.toLowerCase().trim()
    );

    const submitGrade = (asmId: number) => {
      const gradePayload: GradeStudentRequest = {
        title: config.title,
        scoreObtained: this.quickAssessment.scoreObtained,
        weight: config.weight,
        studentId: this.quickAssessment.studentId
      };

      this.assessmentService.gradeStudent(asmId, gradePayload).subscribe({
        next: () => {
          this.toast.success(
            `${config.title} score (${this.quickAssessment.scoreObtained}/${config.maxScore}) recorded for ${student?.name || 'student'}!`
          );
          this.loadAssessments();
          this.loadCourseEnrollments();
        },
        error: (err) => {
          this.toast.error(
            err.error?.detail || err.error?.message || 'Failed to record student score.'
          );
        }
      });
    };

    if (targetAsm) {
      submitGrade(targetAsm.id);
    } else {
      const createPayload: CreateAssessmentRequest = {
        title: config.title,
        maxScore: config.maxScore,
        weight: config.weight
      };
      this.assessmentService.createAssessment(this.selectedCourseId, createPayload).subscribe({
        next: (created) => {
          submitGrade(created.id);
        },
        error: (err) => {
          this.toast.error(err.error?.detail || 'Failed to initialize assessment component.');
        }
      });
    }
  }

  // Ensures all 3 standard components exist for the current course
  ensureStandardCurriculum() {
    const existing = this.assessments();
    const missing = this.standardAssessments.filter(sa =>
      !existing.some(ea => ea.title.toLowerCase().trim() === sa.title.toLowerCase().trim())
    );

    if (missing.length === 0) {
      this.toast.info('All standard components (20% + 30% + 50%) are already registered for this course.');
      return;
    }

    const creationCalls = missing.map(m =>
      this.assessmentService.createAssessment(this.selectedCourseId, {
        title: m.title,
        maxScore: m.maxScore,
        weight: m.weight
      }).pipe(catchError(() => of(null)))
    );

    forkJoin(creationCalls).subscribe({
      next: () => {
        this.toast.success('Standard 100% assessment curriculum successfully initialized for this course!');
        this.loadAssessments();
      }
    });
  }

  onSelectStudent(studentIdVal: any) {
    const sId = Number(studentIdVal);
    if (!sId) {
      this.selectedStudent.set(null);
      this.newGrade.studentId = 0;
      this.quickAssessment.studentId = 0;
      return;
    }

    const found = this.students().find(s => s.id === sId) || null;
    this.selectedStudent.set(found);
    this.newGrade.studentId = sId;
    this.quickAssessment.studentId = sId;
  }

  isStudentEnrolled(studentId: number): boolean {
    return this.courseEnrollments().some(e => e.studentId === studentId);
  }

  loadResults() {
    if (!this.selectedAssessmentId) return;
    this.assessmentService.getResultsByAssessment(Number(this.selectedAssessmentId)).subscribe({
      next: (data) => this.results.set(data || []),
      error: () => this.results.set([])
    });
  }

  toggleAssessment(assessmentId: number) {
    if (this.selectedAssessmentId === assessmentId) {
      this.selectedAssessmentId = null;
      this.results.set([]);
    } else {
      this.selectedAssessmentId = assessmentId;
      const asm = this.assessments().find(a => a.id === assessmentId);
      if (asm) {
        this.newGrade.title = `${asm.title} Attempt 1`;
        this.newGrade.weight = asm.weight;
      }
      this.loadResults();
    }
  }

  deleteAssessment(assessmentId: number) {
    if (!confirm('Are you sure you want to delete this assessment definition?')) return;
    this.assessmentService.deleteAssessment(this.selectedCourseId, assessmentId).subscribe({
      next: () => {
        if (this.selectedAssessmentId === assessmentId) {
          this.selectedAssessmentId = null;
          this.results.set([]);
        }
        this.toast.success('Assessment definition deleted.');
        this.loadAssessments();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Failed to delete assessment.');
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
      next: () => {
        this.toast.success(`Score updated for ${res.studentName}.`);
        this.loadCourseEnrollments();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Failed to update score.');
      }
    });
  }

  deleteResult(resultId: number) {
    if (!this.selectedAssessmentId || !confirm('Are you sure you want to delete this grade record?')) return;
    this.assessmentService.deleteResult(this.selectedAssessmentId, resultId).subscribe({
      next: () => {
        this.results.update(list => list.filter(r => r.id !== resultId));
        this.toast.success('Grade record deleted.');
        this.loadCourseEnrollments();
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Failed to delete record.');
      }
    });
  }
}