import { computed, inject } from '@angular/core';
import { LiveSyncService } from '../services/live-sync.service';

import {
  signalStore,
  withComputed,
  withMethods,
  patchState,
  withState,
} from '@ngrx/signals';
import { withEntities, setAllEntities, updateEntity, addEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, concatMap, tap, catchError, switchMap, EMPTY, merge } from 'rxjs';
import { EnrollmentService } from '../services/enrollment.service';
import { Enrollment } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },
  withState({ isLoading: false, error: null as string | null }),
  withEntities<Enrollment>(),
  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((e: Enrollment) => e.status === 'Pending').length
    ),
  })),
  withMethods((store, api = inject(EnrollmentService), sync = inject(LiveSyncService)) => ({
    // Listens to SignalR live sync stream and updates store state automatically
    listenForLiveUpdates: rxMethod<void>(
      pipe(
        tap(() => sync.connect()),
        switchMap(() =>
          merge(
            sync.events$.pipe(
              tap(event => {
                console.log('SignalR status update event processed in store:', event);
                patchState(
                  store,
                  updateEntity({ 
                    id: Number(event.id), // Converts backend string ID to number to match store entity type
                    changes: { status: event.status } 
                  })
                );
              })
            ),
            sync.enrollmentAdded$.pipe(
              tap(newEnrollment => {
                console.log('SignalR enrollment added event processed in store:', newEnrollment);
                const norm: Enrollment = {
                  ...newEnrollment,
                  id: Number(newEnrollment.id),
                  status: (newEnrollment.status as any) || 'Pending'
                };
                const exists = store.entities().some(e => Number(e.id) === norm.id);
                if (!exists) {
                  patchState(store, addEntity(norm));
                } else {
                  patchState(store, updateEntity({ id: norm.id, changes: norm }));
                }
              })
            )
          )
        )
      )
    ),
    loadEnrollments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(() =>
          api.getAll().pipe(
            tap((rows: Enrollment[]) => patchState(store, setAllEntities(rows), { isLoading: false })),
            catchError(err => {
              patchState(store, { isLoading: false, error: err.message });
              return EMPTY;
            })
          )
        )
      )
    ),
    enrollStudent: rxMethod<{ courseCode: string; studentId: number }>(
      pipe(
        tap(() => patchState(store, { error: null })),
        concatMap((request) =>
          api.create(request.courseCode, request).pipe(
            // tap((createdEnrollment: Enrollment) => {
              
            //   patchState(store, addEntity(createdEnrollment));
            // }),
            tap((createdEnrollment: any) => {
              // Normalize the response to match store entity types and filter rules
              const normId = Number(createdEnrollment?.id || createdEnrollment?.enrollmentId || Date.now());
              const normalizedEnrollment: Enrollment = {
                ...createdEnrollment,
                id: normId,
                studentId: Number(createdEnrollment?.studentId || request.studentId),
                courseCode: createdEnrollment?.courseCode || request.courseCode,
                status: 'Pending',
                enrolledAt: createdEnrollment?.enrolledAt || new Date().toISOString()
              };

              // Instantly add the entity to the store state
              patchState(store, addEntity(normalizedEnrollment));
            }),
            catchError((err) => {
              patchState(store, { error: err.message || 'Failed to enroll in course' });
              return EMPTY;
            })
          )
        )
      )
    ),
    approveEnrollment: rxMethod<number>(
      pipe(
        tap(id => {
          patchState(
            store, 
            updateEntity({ 
              id: id, 
              changes: (entity) => ({ ...entity, status: 'Approved' }) 
            })
          );
        }),
        concatMap(id =>
          api.approve(id).pipe(
            catchError(err => {
              patchState(
                store, 
                updateEntity({ 
                  id: id, 
                  changes: (entity) => ({ ...entity, status: 'Pending' }) 
                })
              );
              patchState(store, { error: 'Server rejected the approval.' });
              return EMPTY;
            })
          )
        )
      )
    )
  }))
);