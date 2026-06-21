import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Job, JobCreate, Application, ApplicationCreate,
  ResumeAnalysisRequest, ResumeAnalysisResponse, ApplicationAnalysis
} from '../models/job.model';
import { PDFExtractResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private apiUrl = 'https://jobtracker-api-8t1b.onrender.com';

  constructor(private http: HttpClient) {}

  // Jobs
  getJobs() {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs/`);
  }

  createJob(data: JobCreate) {
    return this.http.post<Job>(`${this.apiUrl}/jobs/`, data);
  }

  deleteJob(id: number) {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`);
  }

  // Applications
  getApplications() {
    return this.http.get<Application[]>(`${this.apiUrl}/applications/`);
  }

  createApplication(data: ApplicationCreate) {
    return this.http.post<Application>(`${this.apiUrl}/applications/`, data);
  }

  updateApplicationStatus(id: number, status: string) {
    return this.http.patch<Application>(`${this.apiUrl}/applications/${id}`, { status });
  }

  deleteApplication(id: number) {
    return this.http.delete(`${this.apiUrl}/applications/${id}`);
  }

  getApplicationAnalysis(id: number) {
    return this.http.get<ApplicationAnalysis>(`${this.apiUrl}/applications/${id}/analysis`);
  }

  // AI
  analyzeResume(data: ResumeAnalysisRequest) {
    return this.http.post<ResumeAnalysisResponse>(`${this.apiUrl}/ai/analyze-resume`, data);
  }

  extractPdf(pdf_base64: string) {
    return this.http.post<PDFExtractResponse>(`${this.apiUrl}/ai/extract-pdf`, { pdf_base64 });
  }
}