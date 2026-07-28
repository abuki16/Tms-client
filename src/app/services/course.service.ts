import { Service, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Course, CourseDetail, PagedResponse } from "../models/course.model";

@Service()
export class CourseService {
  private http = inject(HttpClient);
  
  private baseUrl = "http://localhost:5049/api/v2/courses";

  getAll(page = 1, pageSize = 50) {
    return this.http
      .get<PagedResponse<Course>>(this.baseUrl, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(
        // V2 returns an envelope with 'data' instead of 'items'
        map((p: any) => p.data)
      );
  }

  getById(id: string) {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`);
  }
}