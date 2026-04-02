import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { JobRequestService } from '../../core/services/job-request.service';
import { JobRequest } from '../../core/models/job-request.model';

@Component({
  selector: 'app-completion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="completion-dialog">
      <div class="dialog-header">
        <div class="header-content">
          <mat-icon class="completion-icon">check_circle</mat-icon>
          <div>
            <h2 mat-dialog-title>Complete Request</h2>
            <p class="request-title">{{ data.request.title }}</p>
          </div>
        </div>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content class="dialog-content">
        <form [formGroup]="form" class="completion-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Completed By *</mat-label>
            <input matInput formControlName="completedBy" placeholder="Who completed this request?">
            <mat-error *ngIf="form.get('completedBy')?.hasError('required')">
              This field is required
            </mat-error>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Duration (minutes)</mat-label>
              <input matInput 
                     type="number" 
                     formControlName="durationMinutes" 
                     placeholder="How long did it take?">
              <mat-hint>Optional: Time spent on this request</mat-hint>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Resolution Summary</mat-label>
            <input matInput 
                   formControlName="resolutionSummary" 
                   placeholder="Brief summary of what was done">
            <mat-hint>Optional: Quick summary of the resolution</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Completion Notes</mat-label>
            <textarea matInput 
                      formControlName="notes" 
                      rows="4"
                      placeholder="Detailed notes about the completion..."></textarea>
            <mat-hint>Optional: Detailed notes, challenges faced, or additional context</mat-hint>
          </mat-form-field>
        </form>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button 
                color="primary" 
                [disabled]="form.invalid || loading"
                (click)="onComplete()">
          <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!loading">check_circle</mat-icon>
          {{ loading ? 'Completing...' : 'Mark as Complete' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .completion-dialog {
      width: 100%;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 24px 24px 0;
      margin-bottom: 16px;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex: 1;
    }

    .completion-icon {
      color: var(--color-success);
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-top: 4px;
    }

    .close-btn {
      color: var(--color-text-secondary);
      margin-top: -8px;
      margin-right: -8px;
    }

    h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .request-title {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 14px;
      line-height: 1.4;
      max-width: 400px;
    }

    .dialog-content {
      padding: 0 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .completion-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .dialog-actions {
      padding: 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      border-top: 1px solid var(--color-border);
      margin-top: 24px;
    }

    mat-form-field {
      width: 100%;
    }

    /* Custom scrollbar for dialog content */
    .dialog-content::-webkit-scrollbar {
      width: 6px;
    }

    .dialog-content::-webkit-scrollbar-track {
      background: var(--color-surface);
    }

    .dialog-content::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 3px;
    }

    /* Loading state */
    button[disabled] {
      opacity: 0.6;
    }

    mat-icon {
      margin-right: 8px;
    }

    /* Animation for loading icon */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    mat-icon[ng-reflect-font-icon="hourglass_empty"] {
      animation: spin 1s linear infinite;
    }
  `]
})
export class CompletionDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(JobRequestService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CompletionDialogComponent>);

  form: FormGroup;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { request: JobRequest }) {
    this.form = this.fb.group({
      completedBy: ['', Validators.required],
      durationMinutes: [''],
      resolutionSummary: [''],
      notes: ['']
    });

    // Pre-fill with assigned person if available
    if (data.request.assignedTo) {
      this.form.patchValue({
        completedBy: data.request.assignedTo
      });
    }
  }

  onComplete() {
    if (this.form.invalid) return;

    this.loading = true;
    const formValue = this.form.value;
    
    const completionData = {
      completedBy: formValue.completedBy,
      durationMinutes: formValue.durationMinutes ? parseInt(formValue.durationMinutes) : undefined,
      resolutionSummary: formValue.resolutionSummary || undefined,
      notes: formValue.notes || undefined
    };

    this.service.recordCompletion(this.data.request.id, completionData).subscribe({
      next: (result) => {
        this.loading = false;
        this.snackBar.open('Request marked as complete!', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error completing request:', error);
        this.snackBar.open('Error completing request. Please try again.', 'Close', { 
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}