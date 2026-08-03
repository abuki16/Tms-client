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
  withState({ isLoading: false, error: null as string | null }),
  withEntities<Enrollment>(),
  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((e: Enrollment) => e.status === 'Pending').length
    ),
  })),
  withMethods((store, api = inject(EnrollmentService)) => ({
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
            tap((createdEnrollment: Enrollment) => {
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
   approveEnrollment: rxMethod<number>(
  pipe(
    tap(id => {
      patchState(store, updateEntity({ id: id, changes: { status: 'Approved' } }));
    }),
    concatMap(id =>
      api.approve(id).pipe(
        catchError(err => {
          patchState(store, updateEntity({ id: id, changes: { status: 'Pending' } }));
          patchState(store, { error: 'Server rejected the approval.' });
          return EMPTY;
        })
      )
    )
  )
)
  }))
);