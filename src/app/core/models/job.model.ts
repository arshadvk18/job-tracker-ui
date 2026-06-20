export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  salary_range: string | null;
  job_url: string | null;
  created_at: string;
}

export interface JobCreate {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary_range?: string;
  job_url?: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'phone_screen'
  | 'technical'
  | 'final_round'
  | 'offer'
  | 'rejected';

export interface Application {
  id: number;
  job_id: number;
  user_id: number;
  status: ApplicationStatus;
  notes: string | null;
  applied_at: string;
  updated_at: string | null;
  job: Job;
}

export interface ApplicationCreate {
  job_id: number;
  notes?: string;
}

export interface ResumeAnalysisRequest {
  resume_text: string;
  job_description: string;
}

export interface ResumeAnalysisResponse {
  match_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  experience_match: 'Strong' | 'Moderate' | 'Weak';
  summary: string;
  interview_tips: string[];
}