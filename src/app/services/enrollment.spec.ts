import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment } from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5049/api/v2/enrollments';

  getAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(this.baseUrl);
  }

  // Added method to create/submit a new enrollment
  create(courseId: number, data: { courseId: number; studentId: number }): Observable<Enrollment> {
    // Ensure payload properties match C# Record/Command property names (PascalCase)
    const payload = {
      CourseId: data.courseId,
      StudentId: data.studentId
    };
    return this.http.post<Enrollment>(this.baseUrl, payload);
  }
  approve(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/approve`, {});
  }
}