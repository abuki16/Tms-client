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

  // Updated to accept courseCode (string) and map to PascalCase for the C# backend command
  create(courseCode: string, data: { courseCode: string; studentId: number }): Observable<Enrollment> {
    const backendPayload = {
      StudentId: data.studentId,
      CourseCode: data.courseCode
    };
    return this.http.post<Enrollment>(this.baseUrl, backendPayload);
  }

  // In enrollment.service.ts
approve(id: number): Observable<void> {
  return this.http.post<void>(`${this.baseUrl}/${id}/approve`, {});
}
}