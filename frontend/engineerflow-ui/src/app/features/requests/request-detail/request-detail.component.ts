import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JobRequestService } from '../../../core/services/job-request.service';
import { JobRequest, RequestStatus } from '../../../core/models/job-request.model';
import { CompletionDialogComponent } from '../../../shared/dialogs/completion-dialog.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="detail-page" *ngIf="request(); else loading">
      <!-- Header -->
      <div class="detail-header">
        <button class="back-btn" (click)="goBack()">
          ← Back to Requests
        </button>
        <div class="header-actions">
          <button class="btn-info print-hide" (click)="printReport()">🖨️ Print Report</button>
          <button class="btn-secondary print-hide" (click)="editRequest()">✏️ Edit</button>
          <button class="btn-success" (click)="markComplete()"
                  *ngIf="request()!.status !== RequestStatus.Completed && request()!.status !== RequestStatus.Cancelled">
            ✅ Mark Complete
          </button>
          <button class="btn-danger" (click)="deleteRequest()">🗑️ Delete</button>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Main Content -->
        <div class="main-col">
          <div class="detail-card">
            <div class="card-top">
              <span class="badge priority-badge" [class]="'priority-' + request()!.priorityLabel.toLowerCase()">
                {{ request()!.priorityLabel }}
              </span>
              <span class="badge status-badge" [class]="'status-' + request()!.statusLabel.toLowerCase().replace(' ', '')">
                {{ request()!.statusLabel }}
              </span>
              <span class="overdue-badge" *ngIf="request()!.isOverdue">⚠️ OVERDUE</span>
            </div>

            <h1 class="detail-title">{{ request()!.title }}</h1>

            <div class="description-section">
              <h3>Description</h3>
              <p>{{ request()!.description }}</p>
            </div>
          </div>

          <!-- Completion Panel -->
          <div class="completion-card" *ngIf="request()!.completionEvent">
            <div class="completion-header">
              <span class="completion-icon">✅</span>
              <h3>Completion Details</h3>
            </div>
            <div class="completion-grid">
              <div class="field">
                <label>Completed By</label>
                <span>{{ request()!.completionEvent!.completedBy }}</span>
              </div>
              <div class="field">
                <label>Completed At</label>
                <span>{{ request()!.completionEvent!.completedAt | date:'medium' }}</span>
              </div>
              <div class="field" *ngIf="request()!.completionEvent!.durationMinutes">
                <label>Duration</label>
                <span>{{ request()!.completionEvent!.durationMinutes }} minutes</span>
              </div>
              <div class="field full" *ngIf="request()!.completionEvent!.resolutionSummary">
                <label>Resolution Summary</label>
                <p>{{ request()!.completionEvent!.resolutionSummary }}</p>
              </div>
              <div class="field full" *ngIf="request()!.completionEvent!.notes">
                <label>Notes</label>
                <p>{{ request()!.completionEvent!.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Audit Trail (Compliance Feature) -->
          <div class="activity-card">
            <div class="section-header">
              <h3>📁 Audit Trail</h3>
              <span class="compliance-badge">Compliance Secure</span>
            </div>
            <div class="timeline" *ngIf="request()!.activityLogs?.length; else noActivity">
              <div class="timeline-item" *ngFor="let log of request()!.activityLogs">
                <div class="timeline-marker" [class]="'action-' + log.action.toLowerCase()"></div>
                <div class="timeline-content">
                  <div class="timeline-top">
                    <span class="action-label">{{ log.action }}</span>
                    <span class="timeline-time">{{ log.timestamp | date:'short' }}</span>
                  </div>
                  <p class="timeline-details">{{ log.details }}</p>
                  <span class="timeline-user" *ngIf="log.user">By: {{ log.user }}</span>
                </div>
              </div>
            </div>
            <ng-template #noActivity>
              <p class="empty-state">No activity logs recorded yet.</p>
            </ng-template>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar-col">
          <div class="meta-card">
            <h3>Request Details</h3>
            <div class="meta-list">
              <div class="meta-row">
                <label>Status</label>
                <select [value]="request()!.status" (change)="updateStatus($event)" class="status-select">
                  <option *ngFor="let s of statusOptions" [value]="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div class="meta-row">
                <label>Priority</label>
                <span class="badge priority-badge" [class]="'priority-' + request()!.priorityLabel.toLowerCase()">
                  {{ request()!.priorityLabel }}
                </span>
              </div>
              <div class="meta-row">
                <label>Requester</label>
                <span>{{ request()!.requesterName }}</span>
              </div>
              <div class="meta-row" *ngIf="request()!.assignedTo">
                <label>Assigned To</label>
                <span>{{ request()!.assignedTo }}</span>
              </div>
              <div class="meta-row" *ngIf="request()!.category">
                <label>Category</label>
                <span class="category-tag">{{ request()!.category }}</span>
              </div>
              <div class="meta-row">
                <label>Created</label>
                <span>{{ request()!.createdAt | date:'mediumDate' }}</span>
              </div>
              <div class="meta-row">
                <label>Last Updated</label>
                <span>{{ request()!.updatedAt | date:'mediumDate' }}</span>
              </div>
              <div class="meta-row" *ngIf="request()!.dueDate">
                <label>Due Date</label>
                <span [class.overdue-text]="request()!.isOverdue">
                  {{ request()!.dueDate | date:'mediumDate' }}
                  <span *ngIf="request()!.isOverdue"> (Overdue)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading request...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .detail-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .back-btn {
      background: none;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      transition: var(--transition);
    }

    .back-btn:hover {
      background: rgba(255,255,255,0.05);
      color: var(--color-text-primary);
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn-secondary {
      background: var(--color-surface-raised);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
      padding: 9px 18px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
    }

    .btn-secondary:hover { background: rgba(255,255,255,0.08); }

    .btn-success {
      background: rgba(16,185,129,0.15);
      color: var(--color-success);
      border: 1px solid rgba(16,185,129,0.3);
      padding: 9px 18px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: var(--transition);
    }

    .btn-success:hover { background: rgba(16,185,129,0.25); }

    .btn-danger {
      background: rgba(239,68,68,0.1);
      color: var(--color-danger);
      border: 1px solid rgba(239,68,68,0.3);
      padding: 9px 18px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
    }

    .btn-danger:hover { background: rgba(239,68,68,0.2); }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
    }

    .main-col { display: flex; flex-direction: column; gap: 20px; }

    .detail-card, .completion-card, .meta-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 28px;
    }

    .card-top {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .detail-title {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 20px 0;
      line-height: 1.3;
    }

    .description-section h3 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--color-text-muted);
      margin: 0 0 10px 0;
    }

    .description-section p {
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin: 0;
    }

    .completion-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .completion-icon { font-size: 22px; }

    .completion-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-success);
    }

    .completion-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field { display: flex; flex-direction: column; gap: 4px; }
    .field.full { grid-column: 1 / -1; }

    .field label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--color-text-muted);
    }

    .field span, .field p {
      color: var(--color-text-primary);
      font-size: 14px;
      margin: 0;
    }

    .meta-card h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .meta-list { display: flex; flex-direction: column; gap: 14px; }

    .meta-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-row label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--color-text-muted);
    }

    .meta-row span {
      font-size: 14px;
      color: var(--color-text-primary);
    }

    .status-select {
      padding: 6px 10px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-primary);
      font-size: 13px;
      cursor: pointer;
    }

    .category-tag {
      display: inline-block;
      background: rgba(59,130,246,0.1);
      color: var(--color-accent);
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .overdue-text { color: var(--color-danger); font-weight: 600; }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-low { background: rgba(100,116,139,0.15); color: #94a3b8; }
    .priority-medium { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .priority-high { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .priority-critical { background: rgba(239,68,68,0.15); color: #f87171; }

    .status-open { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .status-inprogress { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .status-onhold { background: rgba(168,85,247,0.15); color: #c084fc; }
    .status-completed { background: rgba(16,185,129,0.15); color: #34d399; }
    .status-cancelled { background: rgba(100,116,139,0.15); color: #94a3b8; }

    .overdue-badge {
      background: rgba(239,68,68,0.15);
      color: #f87171;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      color: var(--color-text-muted);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Audit Trail Styles */
    .activity-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 28px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .section-header h3 {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .compliance-badge {
      font-size: 9px;
      background: rgba(16,185,129,0.1);
      color: var(--color-success);
      padding: 2px 8px;
      border-radius: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-left: 8px;
    }

    .timeline-item {
      display: flex;
      gap: 20px;
      padding-bottom: 24px;
      position: relative;
    }

    .timeline-item:last-child { padding-bottom: 0; }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 10px;
      bottom: 0;
      width: 1px;
      background: var(--color-border);
    }

    .timeline-item:last-child::before { display: none; }

    .timeline-marker {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: var(--color-border);
      border: 2px solid var(--color-bg);
      z-index: 1;
      margin-top: 6px;
    }

    .action-created { background: #60a5fa; box-shadow: 0 0 0 4px rgba(96,165,250,0.1); }
    .action-updated { background: #fbbf24; box-shadow: 0 0 0 4px rgba(251,191,36,0.1); }
    .action-completed { background: #34d399; box-shadow: 0 0 0 4px rgba(52,211,153,0.1); }
    .action-deleted { background: #f87171; box-shadow: 0 0 0 4px rgba(248,113,113,0.1); }

    .timeline-content { flex: 1; }

    .timeline-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .action-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .timeline-time {
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .timeline-details {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin: 0 0 4px 0;
      line-height: 1.5;
    }

    .timeline-user {
      font-size: 11px;
      color: var(--color-text-muted);
      font-style: italic;
    }

    .empty-state {
      color: var(--color-text-muted);
      font-size: 13px;
      font-style: italic;
      text-align: center;
      padding: 20px 0;
    }

    /* Print Styles */
    @media print {
      :host {
        display: block;
        background: white !important;
        color: black !important;
      }
      
      .print-hide, .back-btn, .sidebar, .header-actions {
        display: none !important;
      }

      .detail-page {
        margin: 0 !important;
        padding: 0 !important;
      }

      .detail-grid {
        display: flex;
        flex-direction: column;
      }

      .detail-card, .completion-card, .meta-card, .activity-card {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin-bottom: 24px !important;
        page-break-inside: avoid;
      }
      
      .meta-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      h1, h3 { color: black !important; }
      p, span { color: #333 !important; }
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  private service = inject(JobRequestService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  request = signal<JobRequest | null>(null);
  RequestStatus = RequestStatus;

  statusOptions = [
    { label: 'Open', value: 0 },
    { label: 'In Progress', value: 1 },
    { label: 'On Hold', value: 2 },
    { label: 'Completed', value: 3 },
    { label: 'Cancelled', value: 4 }
  ];

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.loadRequest(id);
  }

  loadRequest(id: number) {
    this.service.getById(id).subscribe({
      next: req => this.request.set(req),
      error: () => {
        this.snackBar.open('Request not found', 'Close', { duration: 3000 });
        this.router.navigate(['/requests']);
      }
    });
  }

  updateStatus(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = +select.value;
    if (this.request()) {
      this.service.updateStatus(this.request()!.id, newStatus).subscribe(updated => {
        this.request.set(updated);
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      });
    }
  }

  editRequest() {
    this.router.navigate(['/requests', this.request()!.id, 'edit']);
  }

  markComplete() {
    if (!this.request()) return;
    const dialogRef = this.dialog.open(CompletionDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { request: this.request() },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.request.set(result);
        this.snackBar.open('Request marked as complete!', 'Close', { duration: 3000 });
      }
    });
  }

  deleteRequest() {
    if (!this.request()) return;
    const confirmed = confirm(`Delete "${this.request()!.title}"?\n\nThis cannot be undone.`);
    if (confirmed) {
      this.service.delete(this.request()!.id).subscribe({
        next: () => {
          this.snackBar.open('Request deleted', 'Close', { duration: 3000 });
          this.router.navigate(['/requests']);
        },
        error: () => this.snackBar.open('Error deleting request', 'Close', { duration: 3000 })
      });
    }
  }

  goBack() {
    this.router.navigate(['/requests']);
  }

  printReport() {
    window.print();
  }
}
