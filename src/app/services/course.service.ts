import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Course, CourseDetail, PagedResponse, CreateCourseRequest, UpdateCourseRequest } from "../models/course.model";

@Injectable({
  providedIn: "root"
})
export class CourseService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/courses`;

  getAll(page = 1, pageSize = 50) {
    return this.http
      .get<PagedResponse<Course>>(this.baseUrl, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
        withCredentials: true,
      })
      .pipe(
        map((p: PagedResponse<Course>) => p.items || (p as any).data || [])
      );
  }

  getById(id: string) {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
  }

  create(course: CreateCourseRequest) {
    return this.http.post<Course>(this.baseUrl, course, {
      withCredentials: true,
    });
  }

  update(id: number, course: UpdateCourseRequest) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, course, {
      withCredentials: true,
    });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
  }
}