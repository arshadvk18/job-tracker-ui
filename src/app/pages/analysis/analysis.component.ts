import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { JobService } from '../../core/services/job.service';
import { ApplicationAnalysis, Application } from '../../core/models/job.model';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './analysis.component.html'
})
export class AnalysisComponent implements OnInit {
  application = signal<Application | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Invalid application ID');
      this.loading.set(false);
      return;
    }

    // Load all applications and find the one matching this ID
    // (reuses existing endpoint — no extra backend endpoint needed)
    this.jobService.getApplications().subscribe({
      next: (apps) => {
        const found = apps.find(a => a.id === id) ?? null;
        this.application.set(found);
        if (!found) this.error.set('Application not found');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load application data');
        this.loading.set(false);
      }
    });
  }

  get analysis(): ApplicationAnalysis | null {
    return this.application()?.ai_analysis ?? null;
  }

  get scoreColor(): string {
    const score = this.analysis?.match_score ?? 0;
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-500';
  }

  get scoreBarColor(): string {
    const score = this.analysis?.match_score ?? 0;
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}