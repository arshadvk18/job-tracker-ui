import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { ResumeAnalysisResponse, Application } from '../../core/models/job.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterLink],
  templateUrl: './analyze.component.html'
})
export class AnalyzeComponent implements OnInit {
  resumeText = signal('');
  jobDescription = signal('');
  loading = signal(false);
  error = signal('');
  result = signal<ResumeAnalysisResponse | null>(null);

  // Saved resume
  useSavedResume = signal(false);

  // PDF upload
  extracting = signal(false);
  selectedFileName = signal('');

  // Link result to application
  applications = signal<Application[]>([]);
  selectedApplicationId = signal<number | null>(null);

  constructor(
    public authService: AuthService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    // Load applications for the "save to application" dropdown
    this.jobService.getApplications().subscribe({
      next: apps => this.applications.set(apps)
    });

    // If user has a saved resume, pre-toggle it on
    if (this.authService.savedResume()) {
      this.useSavedResume.set(true);
      this.resumeText.set(this.authService.savedResume()!);
    }
  }

  toggleSavedResume(use: boolean) {
    this.useSavedResume.set(use);
    if (use && this.authService.savedResume()) {
      this.resumeText.set(this.authService.savedResume()!);
    } else if (!use) {
      this.resumeText.set('');
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.error.set('Only PDF files are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('File size must be under 5MB');
      return;
    }

    this.selectedFileName.set(file.name);
    this.error.set('');
    this.extracting.set(true);
    this.useSavedResume.set(false);

    const reader = new FileReader();
    reader.onload = () => {
      this.jobService.extractPdf(reader.result as string).subscribe({
        next: (res) => {
          this.extracting.set(false);
          this.resumeText.set(res.extracted_text);
        },
        error: (err) => {
          this.extracting.set(false);
          this.error.set(err.error?.detail || 'Could not extract text from PDF. Try pasting manually.');
          this.selectedFileName.set('');
        }
      });
    };
    reader.onerror = () => {
      this.extracting.set(false);
      this.error.set('Could not read file. Please try again.');
    };
    reader.readAsDataURL(file);
  }

  analyze() {
    if (!this.resumeText().trim() || !this.jobDescription().trim()) {
      this.error.set('Please provide both resume and job description');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.jobService.analyzeResume({
      resume_text: this.resumeText(),
      job_description: this.jobDescription(),
      application_id: this.selectedApplicationId() ?? undefined
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