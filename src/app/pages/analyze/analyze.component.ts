import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { JobService } from '../../core/services/job.service';
import { ResumeAnalysisResponse } from '../../core/models/job.model';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './analyze.component.html'
})
export class AnalyzeComponent {
  resumeText = '';
  jobDescription = '';
  loading = signal(false);
  error = signal('');
  result = signal<ResumeAnalysisResponse | null>(null);

  constructor(private jobService: JobService) {}

  analyze() {
    if (!this.resumeText.trim() || !this.jobDescription.trim()) {
      this.error.set('Please fill in both fields');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.jobService.analyzeResume({
      resume_text: this.resumeText,
      job_description: this.jobDescription
    }).subscribe({
      next: (res) => { this.result.set(res); this.loading.set(false); },
      error: (err) => {
        this.error.set(err.error?.detail || 'Analysis failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  get scoreColor(): string {
    const score = this.result()?.match_score ?? 0;
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-500';
  }

  get scoreBarColor(): string {
    const score = this.result()?.match_score ?? 0;
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}