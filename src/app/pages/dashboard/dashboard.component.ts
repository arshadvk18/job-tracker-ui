import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { Application, ApplicationStatus } from '../../core/models/job.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  applications = signal<Application[]>([]);
  loading = signal(true);

  // Kanban columns
  columns: { label: string; status: ApplicationStatus; color: string }[] = [
    { label: 'Applied',      status: 'applied',      color: 'bg-blue-100 text-blue-800' },
    { label: 'Phone Screen', status: 'phone_screen',  color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Technical',    status: 'technical',     color: 'bg-purple-100 text-purple-800' },
    { label: 'Final Round',  status: 'final_round',   color: 'bg-orange-100 text-orange-800' },
    { label: 'Offer',        status: 'offer',         color: 'bg-green-100 text-green-800' },
    { label: 'Rejected',     status: 'rejected',      color: 'bg-red-100 text-red-800' },
  ];

  constructor(
    public authService: AuthService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    this.jobService.getApplications().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getByStatus(status: ApplicationStatus): Application[] {
    return this.applications().filter(a => a.status === status);
  }

  get stats() {
    const apps = this.applications();
    return {
      total: apps.length,
      offers: apps.filter(a => a.status === 'offer').length,
      interviews: apps.filter(a =>
        ['phone_screen','technical','final_round'].includes(a.status)
      ).length,
      rejected: apps.filter(a => a.status === 'rejected').length
    };
  }

  updateStatus(id: number, status: string) {
    this.jobService.updateApplicationStatus(id, status).subscribe({
      next: (updated) => {
        this.applications.update(apps =>
          apps.map(a => a.id === id ? updated : a)
        );
      }
    });
  }
}