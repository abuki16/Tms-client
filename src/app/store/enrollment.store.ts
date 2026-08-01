import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  patchState,
  withState,
} from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  updateEntity,
  addEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, concatMap, tap, catchError, EMPTY } from 'rxjs';
import { EnrollmentService } from '../services/enrollment.service';
import { Enrollment } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },
  // withState adds simple properties alongside the entity collection
  withState({ isLoading: false, error: null as string | null }),
  // withEntities creates an O(1) ID-indexed dictionary for the enrollment collection.
  withEntities<Enrollment>(),
  // withComputed creates read-only derived signals that update automatically.
  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((e) => e.status === 'Pending').length
    ),
  })),
  withMethods((store, api = inject(EnrollmentService)) => ({
    // Loading Data
    loadEnrollments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(() =>
          api.getAll().pipe(
            tap((rows) => patchState(store, setAllEntities(rows), { isLoading: false })),
            catchError((err) => {
              patchState(store, { isLoading: false, error: err.message });
              return EMPTY;
            })
          )
        )
      )
    ),
    // Enroll Student Method
    enrollStudent: rxMethod<{ courseId: number; studentId: number }>(
      pipe(
        tap(() => patchState(store, { error: null })),
        concatMap((request) =>
          api.create(request.courseId, request).pipe(
            tap((createdEnrollment) => {
              patchState(store, addEntity(createdEnrollment));
            }),
            catchError((err) => {
              patchState(store, { error: err.message || 'Failed to enroll in course' });
              return EMPTY;
            })
          )
        )
      )
    ),
    // Optimistic Approve
    approveEnrollment: rxMethod<string>(
      pipe(
        tap((id) => {
          patchState(store, updateEntity({ id, changes: { status: 'Approved' } }));
        }),
        concatMap((id) =>
          api.approve(id).pipe(
            catchError((err) => {
              patchState(store, updateEntity({ id, changes: { status: 'Pending' } }));
              patchState(store, { error: 'Server rejected the approval. Check enrollment constraints.' });
              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);