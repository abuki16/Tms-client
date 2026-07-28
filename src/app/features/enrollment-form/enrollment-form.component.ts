import { Component, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from "@angular/forms";

@Component({
  selector: "app-enrollment-form",
  standalone: true,
  imports: [ReactiveFormsModule], // Required without this, Angular does not recognize form directives
  templateUrl: "./enrollment-form.component.html",
  styleUrl: "./enrollment-form.component.scss",
})
export class EnrollmentFormComponent {
  // inject(FormBuilder) is Angular's way of requesting a service.
  // It is similar to constructor injection in .NET (like inject ILogger in a C# class).
  // The "private" keyword means only this class can access it.
  private fb = inject(FormBuilder);

  // A signal to track whether the form was submitted (for showing a success message)
  submitted = signal(false);

  // fb.nonNullable.group({...}) creates a form object in TypeScript code.
  // "nonNullable" ensures that all values are typed as 'string' instead of 'string | null'
  // this saves you from writing null-checking code everywhere.
  //
  // Each field is defined as: [defaultValue, validators]
  // Validators are rules that the value must pass before the form is considered valid.
  form = this.fb.nonNullable.group({
    studentId: [
      "",
      [Validators.required, Validators.pattern("^STU-[0-9]{4}$")],
    ],
    // ^^ default value is empty string
    // ^^ two validators: the field is required AND must match the pattern STU-1234
    courseId: ["", Validators.required],
    term: ["Fall 2026", Validators.required], // Pre-filled with a default term
    notes: [""], // No validators; this field is optional
    backupCourses: this.fb.array<FormControl<string>>([]), // Starts empty, user adds rows dynamically
  });

  // "get backups()" is a TypeScript property accessor; it looks like a variable but runs a function.
  // This is a shortcut so you can write "this.backups" instead of "this.form.controls.backupCourses"
  get backups() {
    return this.form.controls.backupCourses;
  }

  // Adds a new empty text input to the backup courses array
  addBackup() {
    this.backups.push(
      this.fb.control("", {
        nonNullable: true,
        validators: Validators.required,
      })
    );
  }

  // Removes a specific backup course row by its position in the array
  removeBackup(index: number) {
    this.backups.removeAt(index);
  }

  submit() {
    if (this.form.valid) {
      // getRawValue() extracts the full form data as a JSON object.
      // IMPORTANT: Do NOT use .value here. If any field is disabled, .value silently
      // drops that field from the object. getRawValue() always includes everything.
      const payload = this.form.getRawValue();
      console.log("Enrollment payload:", payload);
      this.submitted.set(true);
    } else {
      // markAllAsTouched() forces Angular to show validation errors on every field.
      // Without this call, Angular only shows errors on fields the user has clicked on.
      this.form.markAllAsTouched();
    }
  }
}