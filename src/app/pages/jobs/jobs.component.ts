import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { JobService } from '../../core/services/job.service';
import { Job, JobCreate, Application } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './jobs.component.html'
})
export class JobsComponent implements OnInit {
  jobs = signal<Job[]>([]);
  applications = signal<Application[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  error = signal('');

  form: JobCreate = {
    title: '', company: '', location: '',
    description: '', salary_range: '', job_url: ''
  };

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.loadJobs();
    this.loadApplications();
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

  isApplied(jobId: number): boolean {
    return this.applications().some(a => a.job_id === jobId);
  }

  submitJob() {
    if (!this.form.title || !this.form.company) {
      this.error.set('Title and company are required');
      return;
    }
    this.submitting.set(true);
    this.error.set('');

    this.jobService.createJob(this.form).subscribe({
      next: (job) => {
        this.jobs.update(jobs => [job, ...jobs]);
        this.form = {
          title: '', company: '', location: '',
          description: '', salary_range: '', job_url: ''
        };
        this.showForm.set(false);
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('Failed to create job');
        this.submitting.set(false);
      }
    });
  }

  applyToJob(jobId: number) {
    this.jobService.createApplication({ job_id: jobId }).subscribe({
      next: (app) => {
        this.applications.update(apps => [...apps, app]);
      },
      error: (err) => alert(err.error?.detail || 'Could not track application')
    });
  }

  deleteJob(id: number) {
    if (!confirm('Delete this job? Its applications will also be deleted.')) return;
    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.jobs.update(jobs => jobs.filter(j => j.id !== id));
        this.applications.update(apps => apps.filter(a => a.job_id !== id));
      },
      error: () => alert('Could not delete job. Please try again.')
    });
  }
}