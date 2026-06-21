import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthToken, ResumeSave, ResumeResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://jobtracker-api-8t1b.onrender.com';

  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);
  savedResume = signal<string | null>(null);   // ← new: cached resume text

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.isLoggedIn.set(true);
      this.fetchCurrentUser();
      this.fetchResume();            // ← new: load resume on session restore
    }
  }

  register(data: RegisterRequest) {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data);
  }

  login(data: LoginRequest) {
    return this.http.post<AuthToken>(`${this.apiUrl}/auth/login`, data).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isLoggedIn.set(true);
        this.fetchCurrentUser();
        this.fetchResume();          // ← new: load resume on login
      })
    );
  }

  fetchCurrentUser() {
    this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
      next: user => this.currentUser.set(user),
      error: () => this.logout()
    });
  }

  // --- Resume methods (new) ---

  fetchResume() {
    this.http.get<ResumeResponse>(`${this.apiUrl}/auth/resume`).subscribe({
      next: res => this.savedResume.set(res.resume_text),
      error: () => {}    // silently ignore — resume is optional
    });
  }

  saveResume(resume_text: string) {
    return this.http.put<ResumeResponse>(`${this.apiUrl}/auth/resume`, { resume_text } as ResumeSave).pipe(
      tap(res => this.savedResume.set(res.resume_text))
    );
  }

  deleteResume() {
    return this.http.delete(`${this.apiUrl}/auth/resume`).pipe(
      tap(() => this.savedResume.set(null))
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.savedResume.set(null);      // ← new: clear resume on logout
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}