/**
 * List row from the TMS API — mirrors `CourseResponseDto` on `GET /api/courses`.
 * ASP.NET Core defaults to camelCase JSON (`id`, `maxCapacity`, …).
 */
export interface Course {
  id: number;
  code: string;
  title: string;
  maxCapacity: number;
  enrollmentCount: number;
  instructorId?: string | null;
  instructorName?: string | null;
  status?: string;
}

/** Envelope for `GET /api/courses` — Matches C# PagedResponse contract. */
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** One link from `CourseDetailDto.Links` on `GET /api/courses/{id}`. */
export interface CourseLink {
  href: string;
  rel: string;
  method: string;
}

/** Detail payload — mirrors `CourseDetailDto`. */
export interface CourseDetail extends Course {
  links: readonly CourseLink[];
}

/** Request payload for creating a new course. */
export interface CreateCourseRequest {
  code: string;
  title: string;
  maxCapacity: number;
}

/** Request payload for updating an existing course. */
export interface UpdateCourseRequest {
  code: string;
  title: string;
  maxCapacity: number;
}