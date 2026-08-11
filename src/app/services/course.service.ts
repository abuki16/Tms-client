import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Course, CourseDetail, PagedResponse } from "../models/course.model";

@Injectable({
  providedIn: "root"
})
export class CourseService {
  private http = inject(HttpClient);
  // Replaced hardcoded localhost URL with the environment configuration base path
  private readonly baseUrl = `${environment.apiUrl}/courses`;

  getAll(page = 1, pageSize = 50) {
    return this.http
      .get<PagedResponse<Course>>(this.baseUrl, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(
        // Map to 'items' based on your PagedResponse interface contract
        map((p: PagedResponse<Course>) => p.items || (p as any).data || [])
      );
  }

  getById(id: string) {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`);
  }
}