import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { catchError, EMPTY } from 'rxjs';
import { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';

interface CourseState {
  error: string | null;
}

const initialState: CourseState = {
  error: null
};

export const CourseStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Course>(),
  withMethods((store, svc = inject(CourseService)) => ({
    deleteCourse(id: number) {
      // 1. Take snapshot of current entities BEFORE mutating local state[cite: 1]
      const previousSnapshot = store.entities();
      
      // 2. Instant visual feedback — remove entity immediately from local UI[cite: 1]
      patchState(store, removeEntity(id));
      
      // 3. Dispatch API call to backend server[cite: 1]
      svc.delete(id).pipe(
        catchError(err => {
          // 4. Server rejected request — restore previous snapshot and set error message[cite: 1]
          patchState(store, setAllEntities(previousSnapshot));
          patchState(store, {
            error: 'Cannot delete course: active student enrollments exist.'
          });
          return EMPTY;
        })
      ).subscribe();
    }
  }))
);