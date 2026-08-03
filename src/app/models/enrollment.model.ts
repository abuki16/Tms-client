export interface Enrollment {
  id: string | number;
  studentId: number;
  studentName?: string;
  courseId: number;
  courseCode?: string;
  courseName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  enrolledAt: string;
}