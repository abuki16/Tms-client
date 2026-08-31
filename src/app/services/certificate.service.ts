import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificateResponseDto, IssueCertificateRequest } from '../models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  // Update this URL to match your backend port (e.g., http://localhost:5049/api/Certificates)
  private apiUrl = 'https://localhost:5049/api/Certificates';

  constructor(private http: HttpClient) {}

  // POST: Issue a new certificate
  issueCertificate(request: IssueCertificateRequest): Observable<CertificateResponseDto> {
    return this.http.post<CertificateResponseDto>(this.apiUrl, request);
  }

  // GET: Get certificates by student ID
  getCertificatesByStudent(studentId: number): Observable<CertificateResponseDto[]> {
    return this.http.get<CertificateResponseDto[]>(`${this.apiUrl}/student/${studentId}`);
  }

  // DELETE: Revoke a certificate
  revokeCertificate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}