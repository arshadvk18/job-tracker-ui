import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">

          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2 flex-shrink-0">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="font-bold text-gray-900 text-lg">JobTracker</span>
          </a>

          <!-- Desktop Nav Links -->
          <div class="hidden md:flex items-center gap-1">
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

          <!-- Desktop User -->
          <div class="hidden md:flex items-center gap-3">
            <span class="text-sm text-gray-600">
              {{ authService.currentUser()?.full_name || authService.currentUser()?.email }}
            </span>
            <button (click)="authService.logout()"
              class="text-sm text-red-500 hover:text-red-700 font-medium transition">
              Logout
            </button>
          </div>

          <!-- Mobile hamburger button -->
          <button (click)="menuOpen.set(!menuOpen())"
            class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            @if (menuOpen()) {
              <!-- X icon -->
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            } @else {
              <!-- Hamburger icon -->
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            }
          </button>

        </div>
      </div>

      <!-- Mobile Menu -->
      @if (menuOpen()) {
        <div class="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-primary-50 text-primary-600"
            (click)="menuOpen.set(false)"
            class="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Dashboard
          </a>
          <a routerLink="/jobs" routerLinkActive="bg-primary-50 text-primary-600"
            (click)="menuOpen.set(false)"
            class="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Jobs
          </a>
          <a routerLink="/analyze" routerLinkActive="bg-primary-50 text-primary-600"
            (click)="menuOpen.set(false)"
            class="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            AI Analyzer
          </a>
          <div class="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between">
            <span class="text-sm text-gray-600 truncate">
              {{ authService.currentUser()?.full_name || authService.currentUser()?.email }}
            </span>
            <button (click)="authService.logout()"
              class="text-sm text-red-500 hover:text-red-700 font-medium transition ml-3">
              Logout
            </button>
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  menuOpen = signal(false);
  constructor(public authService: AuthService) {}
}