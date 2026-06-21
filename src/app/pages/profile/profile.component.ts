import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  // UI state
  editMode = signal(false);
  saving = signal(false);
  deleting = signal(false);
  extracting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Resume content being edited
  draftText = signal('');

  // Tab: 'text' or 'upload'
  activeTab = signal<'text' | 'upload'>('text');

  // PDF upload state
  selectedFileName = signal('');
  extractedPreview = signal('');

  hasResume = computed(() => !!this.authService.savedResume());

  constructor(
    public authService: AuthService,
    private jobService: JobService
  ) {}

  ngOnInit() {
    // Pre-fill draft with saved resume if exists
    this.draftText.set(this.authService.savedResume() ?? '');
  }

  startEdit() {
    this.draftText.set(this.authService.savedResume() ?? '');
    this.editMode.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  cancelEdit() {
    this.editMode.set(false);
    this.extractedPreview.set('');
    this.selectedFileName.set('');
    this.activeTab.set('text');
    this.errorMsg.set('');
  }

  saveResume() {
    const text = this.draftText().trim();
    if (!text) {
      this.errorMsg.set('Resume cannot be empty');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');
    this.authService.saveResume(text).subscribe({
      next: () => {
        this.saving.set(false);
        this.editMode.set(false);
        this.successMsg.set('Resume saved successfully');
        this.extractedPreview.set('');
        this.selectedFileName.set('');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Failed to save resume. Please try again.');
      }
    });
  }

  deleteResume() {
    if (!confirm('Delete your saved resume? This cannot be undone.')) return;
    this.deleting.set(true);
    this.authService.deleteResume().subscribe({
      next: () => {
        this.deleting.set(false);
        this.editMode.set(false);
        this.draftText.set('');
        this.successMsg.set('Resume deleted');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.deleting.set(false);
        this.errorMsg.set('Failed to delete resume. Please try again.');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.errorMsg.set('Only PDF files are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg.set('File size must be under 5MB');
      return;
    }

    this.selectedFileName.set(file.name);
    this.errorMsg.set('');
    this.extracting.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.jobService.extractPdf(base64).subscribe({
        next: (res) => {
          this.extracting.set(false);
          this.extractedPreview.set(res.extracted_text);
          this.draftText.set(res.extracted_text);
          this.activeTab.set('text');   // switch to text tab to show extracted content
        },
        error: (err) => {
          this.extracting.set(false);
          this.errorMsg.set(err.error?.detail || 'Could not extract text from PDF. Try pasting manually.');
          this.selectedFileName.set('');
        }
      });
    };
    reader.onerror = () => {
      this.extracting.set(false);
      this.errorMsg.set('Could not read file. Please try again.');
    };
    reader.readAsDataURL(file);
  }
}