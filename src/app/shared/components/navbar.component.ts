import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">

          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="font-bold text-gray-900 text-lg">JobTracker</span>
          </a>

          <!-- Nav Links -->
          <div class="flex items-center gap-1">
            <a routerLink="/dashboard" routerLinkActive="bg-primary-50 text-primary-600"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Dashboard
            </a>
            <a routerLink="/jobs" routerLinkActive="bg-primary-50 text-primary-600"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Jobs
            </a>
            <a routerLink="/analyze" routerLinkActive="bg-primary-50 text-primary-600"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              AI Analyzer
            </a>
          </div>

          <!-- User -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-600 hidden sm:block">
              {{ authService.currentUser()?.full_name || authService.currentUser()?.email }}
            </span>
            <button (click)="authService.logout()"
              class="text-sm text-red-500 hover:text-red-700 font-medium transition">
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}