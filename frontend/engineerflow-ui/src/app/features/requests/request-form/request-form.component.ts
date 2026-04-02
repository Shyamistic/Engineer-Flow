import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { JobRequestService } from '../../../core/services/job-request.service';
import { Priority, JobRequest } from '../../../core/models/job-request.model';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEdit() ? 'Edit Request' : 'New Request' }}</h1>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="request-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Title *</mat-label>
            <input matInput formControlName="title" placeholder="Brief description of the request">
            <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required</mat-error>
            <mat-error *ngIf="form.get('title')?.hasError('minlength')">Title must be at least 3 characters</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description *</mat-label>
            <textarea matInput formControlName="description" rows="4" 
                      placeholder="Detailed description of what needs to be done"></textarea>
            <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Requester Name *</mat-label>
            <input matInput formControlName="requesterName" placeholder="Who is requesting this?">
            <mat-error *ngIf="form.get('requesterName')?.hasError('required')">Requester name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Assigned To</mat-label>
            <input matInput formControlName="assignedTo" placeholder="Who should work on this?">
          </mat-form-field>
        </div>

        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Priority *</mat-label>
            <mat-select formControlName="priority">
              <mat-option [value]="Priority.Low">Low</mat-option>
              <mat-option [value]="Priority.Medium">Medium</mat-option>
              <mat-option [value]="Priority.High">High</mat-option>
              <mat-option [value]="Priority.Critical">Critical</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('priority')?.hasError('required')">Priority is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option value="Bug Fix">Bug Fix</mat-option>
              <mat-option value="Feature Request">Feature Request</mat-option>
              <mat-option value="Infrastructure">Infrastructure</mat-option>
              <mat-option value="Documentation">Documentation</mat-option>
              <mat-option value="Security">Security</mat-option>
              <mat-option value="Performance">Performance</mat-option>
              <mat-option value="Maintenance">Maintenance</mat-option>
              <mat-option value="Research">Research</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button type="button" mat-stroked-button (click)="goBack()">Cancel</button>
          <button type="submit" mat-raised-button color="primary" 
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Saving...' : (isEdit() ? 'Update Request' : 'Create Request') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    .form-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .back-btn {
      color: var(--color-text-secondary);
    }

    .request-form {
      background: var(--color-surface);
      padding: 32px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .form-row {
      margin-bottom: 24px;
    }

    .form-row.two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--color-border);
    }

    mat-form-field {
      width: 100%;
    }

    @media (max-width: 768px) {
      .form-row.two-columns {
        grid-template-columns: 1fr;
      }
      
      .form-container {
        padding: 16px;
      }
      
      .request-form {
        padding: 24px 16px;
      }
    }
  `]
})
export class RequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(JobRequestService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  loading = signal(false);
  isEdit = signal(false);
  requestId: number | null = null;
  Priority = Priority;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      requesterName: ['', Validators.required],
      assignedTo: [''],
      priority: [Priority.Medium, Validators.required],
      category: [''],
      dueDate: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.requestId = +id;
      this.isEdit.set(true);
      this.loadRequest();
    }
  }

  loadRequest() {
    if (!this.requestId) return;
    
    this.loading.set(true);
    this.service.getById(this.requestId).subscribe({
      next: (request) => {
        this.form.patchValue({
          title: request.title,
          description: request.description,
          requesterName: request.requesterName,
          assignedTo: request.assignedTo,
          priority: request.priority,
          category: request.category,
          dueDate: request.dueDate ? new Date(request.dueDate) : null
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading request:', error);
        this.snackBar.open('Error loading request', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.value;
    
    // Format the date properly
    const requestData = {
      ...formValue,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate).toISOString() : null
    };

    const operation = this.isEdit() && this.requestId
      ? this.service.update(this.requestId, requestData)
      : this.service.create(requestData);

    operation.subscribe({
      next: (result) => {
        this.loading.set(false);
        this.snackBar.open(
          this.isEdit() ? 'Request updated successfully' : 'Request created successfully',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/requests', result.id]);
      },
      error: (error) => {
        console.error('Error saving request:', error);
        this.loading.set(false);
        this.snackBar.open('Error saving request', 'Close', { duration: 3000 });
      }
    });
  }

  goBack() {
    this.router.navigate(['/requests']);
  }
}