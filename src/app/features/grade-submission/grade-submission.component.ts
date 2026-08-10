import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, exhaustMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GradeService, GradePayload } from '../../services/grade.service';

@Component({
  selector: 'tms-grade-submission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './grade-submission.component.html'
})
export class GradeSubmissionComponent {
  private api = inject(GradeService);
  private fb = inject(FormBuilder);

  // Reactive Form definition with initial model values and validators
  gradeForm = this.fb.group({
    studentId: [101, [Validators.required, Validators.min(1)]],
    courseId: [302, [Validators.required, Validators.min(1)]],
    score: [88, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  isSubmitting = false;
  submissionStatus = '';

  // A Subject is a manual event stream — template clicks push payloads into it[cite: 2]
  private submitClick$ = new Subject<GradePayload>();

  constructor() {
    this.submitClick$
      .pipe(
        // exhaustMap: while the inner HTTP observable is active,
        // ALL new emissions from submitClick$ are silently dropped.
        // Dawit can click 50 times — only ONE POST request fires.[cite: 2]
        exhaustMap(payload => {
          this.isSubmitting = true;
          this.submissionStatus = 'Submitting grade to server...';
          return this.api.postGrade(payload);
        }),
        // takeUntilDestroyed: automatically unsubscribes when Angular
        // destroys this component, preventing memory leaks.
        // Placed inside constructor to inherit the active injection context.[cite: 2]
        takeUntilDestroyed()
      )
      .subscribe({
  next: (result: any) => {
    this.isSubmitting = false;
    this.submissionStatus = `Grade saved successfully! Record ID: ${result.id}`;
    this.gradeForm.reset({ studentId: 101, courseId: 302, score: 88 });
  },
  error: (err) => {
    this.isSubmitting = false;
    this.submissionStatus = `Submission failed: ${err.message || 'Server error'}`;
  }
});
  }

  // The template form submit handler pushes valid values into the protected stream[cite: 2]
  onSubmit() {
    if (this.gradeForm.valid) {
      const rawValue = this.gradeForm.getRawValue();
      this.submitClick$.next({
        studentId: Number(rawValue.studentId),
        courseId: Number(rawValue.courseId),
        score: Number(rawValue.score)
      });
    }
  }
}