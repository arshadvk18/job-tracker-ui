export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// --- Resume interfaces (new) ---

export interface ResumeSave {
  resume_text: string;
}

export interface ResumeResponse {
  resume_text: string | null;
}

export interface PDFExtractResponse {
  extracted_text: string;
  char_count: number;
}