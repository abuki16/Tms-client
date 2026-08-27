import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'tms-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  // Filter helper for items awaiting admin approval
  get pendingEnrollments() {
    return this.store.entities().filter(e => e.status === 'Pending');
  }

  updateStatus(id: string | number, status: 'Approved' | 'Rejected') {
    if (typeof (this.store as any).updateStatus === 'function') {
      (this.store as any).updateStatus(id, status);
    }
  }

  refreshData() {
    this.store.loadEnrollments();
  }
}