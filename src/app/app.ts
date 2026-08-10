import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnrollmentStore } from './store/enrollment.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('tms-client');
  private store = inject(EnrollmentStore);

  ngOnInit() {
    // 1. Fetch initial enrollment data
    this.store.loadEnrollments();
    
    // 2. Open WebSocket connection and listen for real-time changes
    this.store.listenForLiveUpdates();
    
  }
}