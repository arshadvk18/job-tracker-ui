import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { Job, JobCreate, Application } from '../../core/models/job.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterLink],
  templateUrl: './jobs.component.html'
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs = signal<Job[]>([]);
  applications = signal<Application[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  error = signal('');

  // Resume modal state
  showResumeModal = signal(false);
  countdown = signal(10);
  private countdownTimer: any = null;

  // Toast state
  toastMsg = signal('');
  toastType = signal<'success' | 'error'>('success');
  private toastTimer: any = null;

  form: JobCreate = {
    title: '', company: '', location: '',
    description: '', salary_range: '', job_url: ''
  };

  constructor(
    private jobService: JobService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadJobs();
    this.loadApplications();
  }

  ngOnDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  loadJobs() {
    this.jobService.getJobs().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadApplications() {
    this.jobService.getApplications().subscribe({
      next: (apps) => this.applications.set(apps)
    });
  }

  getApplication(jobId: number): Application | undefined {
    return this.applications().find(a => a.job_id === jobId);
  }

  isApplied(jobId: number): boolean {
    return this.applications().some(a => a.job_id === jobId);
  }

  handleAddJobClick() {
    if (!this.authService.savedResume()) {
      this.openResumeModal();
    } else {
      this.showForm.set(!this.showForm());
    }
  }

  openResumeModal() {
    this.showResumeModal.set(true);
    this.countdown.set(10);
    this.countdownTimer = setInterval(() => {
      this.countdown.update(c => c - 1);
      if (this.countdown() <= 0) {
        this.goToProfileNow();
      }
    }, 1000);
  }

  closeResumeModal() {
    this.showResumeModal.set(false);
    this.countdown.set(10);
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  goToProfileNow() {
    this.closeResumeModal();
    this.router.navigate(['/profile'], { queryParams: { from: 'jobs' } });
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg);
    this.toastType.set(type);
    this.toastTimer = setTimeout(() => this.toastMsg.set(''), 4000);
  }

  submitJob() {
    // ← description is now mandatory alongside title and company
    if (!this.form.title || !this.form.company || !this.form.description?.trim()) {
      this.error.set('Title, company and job description are required');
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    const hasResume = !!this.authService.savedResume();
    const jobDescription = this.form.description.trim();

    this.jobService.createJob(this.form).pipe(
      switchMap(job => {
        this.jobs.update(jobs => [job, ...jobs]);
        return this.jobService.createApplication({ job_id: job.id }).pipe(
          switchMap(app => {
            this.applications.update(apps => [...apps, app]);
            if (hasResume && jobDescription.length > 0) {
              return this.jobService.analyzeResume({
                resume_text: this.authService.savedResume()!,
                job_description: jobDescription,
                application_id: app.id
              });
            }
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form = {
          title: '', company: '', location: '',
          description: '', salary_range: '', job_url: ''
        };
        if (result && 'match_score' in result) {
          this.loadApplications();
          this.showToast(`AI analysis complete — score: ${result.match_score}%`);
        } else {
          this.showToast('Job saved successfully!');
        }
      },
      error: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form = {
          title: '', company: '', location: '',
          description: '', salary_range: '', job_url: ''
        };
        this.showToast('Job saved! AI analysis could not run — try from Analyze page.', 'error');
      }
    });
  }

  applyToJob(jobId: number) {
    this.jobService.createApplication({ job_id: jobId }).subscribe({
      next: (app) => this.applications.update(apps => [...apps, app]),
      error: (err) => this.showToast(err.error?.detail || 'Could not track application', 'error')
    });
  }

  deleteJob(id: number) {
    if (!confirm('Delete this job? Its applications will also be deleted.')) return;
    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.jobs.update(jobs => jobs.filter(j => j.id !== id));
        this.applications.update(apps => apps.filter(a => a.job_id !== id));
      },
      error: () => this.showToast('Could not delete job. Please try again.', 'error')
    });
  }
}