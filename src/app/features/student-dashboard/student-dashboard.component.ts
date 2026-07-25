// These are the Angular functions we need. signal() and computed() come from Angular's core.
import { Component, signal, computed } from "@angular/core";

// The @Component decorator tells Angular: "This class is a visual component."
// It is metadata: it describes how this class connects to the HTML template.
@Component({
  selector: "app-student-dashboard", // The HTML tag name: <app-student-dashboard></app-student-dashboard>
  standalone: true, // This component manages its own imports (no NgModule)
  imports: [],
  templateUrl: "./student-dashboard.component.html", // Points to the HTML file
  styleUrl: "./student-dashboard.component.scss", // Points to the styles file
})
export class StudentDashboardComponent {
  // signal('Liya Kebede') creates a reactive variable. Angular watches it.
  // When its value changes, Angular automatically updates the part of the screen that displays it.
  studentName = signal("Liya Kebede");
  earnedCredits = signal(45);

  // computed() creates a read-only signal that derives its value from other signals.
  // It recalculates automatically whenever earnedCredits() changes: no manual refresh.
  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress",
  );

  // A regular method. When called, it updates the earnedCredits signal.
  // The .update() method receives the current value (c) and returns the new value (c + 3).
  registerForClass() {
    this.earnedCredits.update((c) => c + 3);
  }
}