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
  // Internally, it stores { ids: string[], entityMap: Record }
  // so lookups and updates by ID are instant — no array scanning.
  withEntities<Enrollment>(),
  // withComputed creates read-only derived signals that update automatically.
  // pendingCount recalculates every time the entity collection changes.
  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((e) => e.status === 'Pending').length
    ),
  })),
  withMethods((store, api = inject(EnrollmentService)) => ({
    // Loading Data
    // Why concatMap here? Because concatMap processes one emission at a time
    // in strict order. If something triggers loadEnrollments() twice quickly,
    // concatMap waits for the first HTTP response before starting the second.
    // switchMap would cancel the first request (data loss risk).
    // mergeMap would run both in parallel (race condition risk).
    loadEnrollments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(() =>
          api.getAll().pipe(
            tap((rows) => patchState(store, setAllEntities(rows), { isLoading: false })),
            catchError((err) => {
              patchState(store, { isLoading: false, error: err.message });
              return EMPTY; // EMPTY completes silently so the rxMethod pipeline survives
            })
          )
        )
      )
    ),
    // Optimistic Approve
    // Step 1: Instantly flip the status to "Approved" in the store.
    // Every component reading from the store sees the change immediately.
    // Step 2: Send the approval to the server.
    // Step 3: If the server rejects it, roll back the status to "Pending."
    approveEnrollment: rxMethod<string>(
      pipe(
        tap((id) => {
          // Optimistic update — the UI reacts before the network round-trip completes
          patchState(store, updateEntity({ id, changes: { status: 'Approved' } }));
        }),
        concatMap((id) =>
          api.approve(id).pipe(
            catchError((err) => {
              // Server said no — restore the previous state
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