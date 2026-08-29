import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrarService {
  private http = inject(HttpClient);
  private baseUrl = '/api/registrar';

  getActiveHighGpaCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/active-high-gpa-count`);
  }

  getCoursesByEnrollments(): Observable<{ title: string; enrollmentCount: number }[]> {
    return this.http.get<{ title: string; enrollmentCount: number }[]>(`${this.baseUrl}/courses-by-enrollments`);
  }

  getAverageGpaPerCourse(): Observable<{ courseTitle: string; averageGpa: number }[]> {
    return this.http.get<{ courseTitle: string; averageGpa: number }[]>(`${this.baseUrl}/average-gpa-per-course`);
  }

  getUnenrolledStudents(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/unenrolled-students`);
  }
}