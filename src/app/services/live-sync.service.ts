import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Enrollment } from '../models/enrollment.model';

import { AuthService } from './auth.service';

export interface EnrollmentStatusEvent {
  id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Injectable({
  providedIn: 'root'
})
export class LiveSyncService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private connection: HubConnection | null = null;
  private eventsSubject = new Subject<EnrollmentStatusEvent>();
  private enrollmentAddedSubject = new Subject<Enrollment>();

  // Expose events as observables — components or stores can subscribe to these
  events$ = this.eventsSubject.asObservable();
  enrollmentAdded$ = this.enrollmentAddedSubject.asObservable();

  // Connection state signal for UI status feedback
  connectionState = signal<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  connect() {
    // Guard against duplicate connections if called more than once
    if (this.connection) return;

    // SignalR uses WebSockets which only exist in browsers, not during SSR server rendering.
    if (!isPlatformBrowser(this.platformId)) return;

    // Connect to the WebSocket hub endpoint via our proxy configuration
    this.connection = new HubConnectionBuilder()
      .withUrl('/hubs/tms', {
        withCredentials: true,
        accessTokenFactory: () => this.authService.getAccessToken() || ''
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();
      
    // Listen for the strongly-typed backend status event broadcast
    this.connection.on(
      'ReceiveEnrollmentStatusUpdated',
      (enrollmentId: string, status: 'Pending' | 'Approved' | 'Rejected') => {
        console.log('WS Broadcast caught by service:', enrollmentId, status);
        this.eventsSubject.next({ id: enrollmentId, status });
      }
    );

    // Listen for newly created enrollment broadcast
    this.connection.on('ReceiveEnrollmentAdded', (enrollment: any) => {
      console.log('WS ReceiveEnrollmentAdded caught by service:', enrollment);
      this.enrollmentAddedSubject.next(enrollment);
    });

    this.connection.onreconnecting(() => this.connectionState.set('reconnecting'));
    this.connection.onreconnected(() => this.connectionState.set('connected'));
    this.connection.onclose(() => this.connectionState.set('disconnected'));

    this.connection
      .start()
      .then(() => this.connectionState.set('connected'))
      .catch((err: any) => console.error('SignalR connection error:', err));
  }
}