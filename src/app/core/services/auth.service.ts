import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthToken } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://jobtracker-api-8t1b.onrender.com';

  // Angular 19 signals — reactive state without BehaviorSubject boilerplate
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    // Restore session on page refresh
    const token = localStorage.getItem('access_token');
    if (token) {
      this.isLoggedIn.set(true);
      this.fetchCurrentUser();
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
      })
    );
  }

  fetchCurrentUser() {
    this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
      next: user => this.currentUser.set(user),
      error: () => this.logout()
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}