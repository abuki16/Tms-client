import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradePayload {
  studentId: number;
  courseId: number;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  
  // Inject HttpClient here so this.http works
  constructor(private http: HttpClient) {}

  postGrade(payload: GradePayload): Observable<{ id: string; success: boolean }> {
    return this.http.post<{ id: string; success: boolean }>('/api/grades', payload, { 
      withCredentials: true 
    });
  }
}