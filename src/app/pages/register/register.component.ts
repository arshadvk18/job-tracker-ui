import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  full_name = '';
  loading = signal(false);
  error = signal('');
  success = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Email and password are required');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register({
      email: this.email,
      password: this.password,
      full_name: this.full_name
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Account created! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Registration failed. Please try again.');
      }
    });
  }
}