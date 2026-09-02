import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GradeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/grades';

  getGrades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}