import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'tms-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.scss'
})
export class InstructorDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  refreshData() {
    this.store.loadEnrollments();
  }
}