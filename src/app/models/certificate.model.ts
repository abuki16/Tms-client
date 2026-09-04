export interface LinkDto {
  href: string;
  rel: string;
  method: string;
}

export interface CertificateResponseDto {
  id: number;
  serialNumber: string;
  issuedAt: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  gpa?: number;
  grade?: number;
  links: LinkDto[];
}

export interface IssueCertificateRequest {
  studentId: number;
  courseId: number;
  serialNumber: string;
  grade?: number;
}