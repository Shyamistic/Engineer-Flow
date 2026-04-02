import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobRequestService } from '../../../core/services/job-request.service';
import { JobRequest, JobRequestFilters } from '../../../core/models/job-request.model';
import { RequestCardComponent } from '../../../shared/components/request-card.component';
import { CompletionDialogComponent } from '../../../shared/dialogs/completion-dialog.component';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RequestCardComponent, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="request-list">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Job Requests</h1>
          <p class="subtitle">{{ totalCount() }} total requests</p>
        </div>
        <button class="btn-primary" (click)="openNewRequest()">＋ New Request</button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <input class="search-input" placeholder="🔍 Search by title, requester, description..." 
               [ngModel]="filters().search" (ngModelChange)="updateSearch($event)" />
        <div class="filter-chips">
          <button class="chip" [class.active]="filters().status === s.value" 
                  *ngFor="let s of statusOptions" (click)="setStatus(s.value)">{{ s.label }}</button>
        </div>
        <select class="sort-select" [ngModel]="filters().sortBy" (ngModelChange)="updateSort($event)">
          <option value="updatedAt">Last Updated</option>
          <option value="priority">Priority</option>
          <option value="createdAt">Created</option>
          <option value="dueDate">Due Date</option>
        </select>
      </div>

      <!-- Loading -->
      <div class="loading-bar" *ngIf="loading()">
        <div class="loading-fill"></div>
      </div>

      <!-- Grid -->
      <div class="requests-grid" *ngIf="!loading()">
        @for (req of pagedRequests(); track req.id) {
          <app-request-card
            [request]="req"
            (click)="viewRequest(req.id)"
            (complete)="completeRequest($event)"
            (edit)="editRequest($event)"
            (delete)="deleteRequest($event)" />
        }
      </div>

      <!-- Empty State -->
      @if (!loading() && pagedRequests().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No requests found</h3>
          <p>Try adjusting your filters or create a new request</p>
          <button class="btn-primary" (click)="openNewRequest()">＋ New Request</button>
        </div>
      }

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="pagination">
          <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
            ← Prev
          </button>

          <div class="page-numbers">
            @for (p of visiblePages(); track p) {
              @if (p === -1) {
                <span class="page-ellipsis">…</span>
              } @else {
                <button class="page-num" [class.active]="p === currentPage()" (click)="goToPage(p)">
                  {{ p }}
                </button>
              }
            }
          </div>

          <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
            Next →
          </button>

          <span class="page-info">
            {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, totalCount()) }} of {{ totalCount() }}
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .request-list { max-width: 1200px; margin: 0 auto; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .page-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { font-size: 13px; color: var(--color-text-muted); margin: 0; }

    .btn-primary {
      background: var(--color-accent);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition);
      white-space: nowrap;
    }
    .btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }

    .filter-bar {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-input {
      padding: 10px 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 14px;
      flex: 1;
      min-width: 260px;
      outline: none;
      transition: var(--transition);
    }
    .search-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-glow); }
    .search-input::placeholder { color: var(--color-text-muted); }

    .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }

    .chip {
      padding: 7px 14px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      color: var(--color-text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
      white-space: nowrap;
    }
    .chip:hover { border-color: var(--color-accent); color: var(--color-accent); }
    .chip.active { background: var(--color-accent); color: white; border-color: var(--color-accent); }

    .sort-select {
      padding: 9px 12px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 13px;
      outline: none;
      cursor: pointer;
    }

    .loading-bar {
      height: 3px;
      background: var(--color-border);
      border-radius: 2px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .loading-fill {
      height: 100%;
      background: var(--color-accent);
      animation: loading 1.2s ease-in-out infinite;
    }
    @keyframes loading {
      0% { width: 0; margin-left: 0; }
      50% { width: 60%; margin-left: 20%; }
      100% { width: 0; margin-left: 100%; }
    }

    .requests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 0;
      color: var(--color-text-muted);
    }
    .empty-icon { font-size: 56px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; color: var(--color-text-secondary); margin: 0 0 8px; }
    .empty-state p { margin: 0 0 24px; }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px 0;
      flex-wrap: wrap;
    }

    .page-btn {
      padding: 8px 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
    }
    .page-btn:hover:not(:disabled) { border-color: var(--color-accent); color: var(--color-accent); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .page-numbers { display: flex; gap: 4px; align-items: center; }

    .page-num {
      width: 36px;
      height: 36px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page-num:hover { border-color: var(--color-accent); color: var(--color-accent); }
    .page-num.active { background: var(--color-accent); border-color: var(--color-accent); color: white; font-weight: 600; }

    .page-ellipsis { color: var(--color-text-muted); padding: 0 4px; }

    .page-info {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-left: 8px;
    }
  `]
})
export class RequestListComponent implements OnInit {
  private service = inject(JobRequestService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  Math = Math;
  pageSize = PAGE_SIZE;

  allRequests = signal<JobRequest[]>([]);
  loading = signal(false);
  filters = signal<JobRequestFilters>({ sortBy: 'updatedAt', descending: true });
  currentPage = signal(1);

  totalCount = computed(() => this.allRequests().length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));

  pagedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.allRequests().slice(start, start + this.pageSize);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push(-1); // ellipsis
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push(-1); // ellipsis
    pages.push(total);
    return pages;
  });

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'InProgress' },
    { label: 'On Hold', value: 'OnHold' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  ngOnInit() { this.loadRequests(); }

  loadRequests() {
    this.loading.set(true);
    this.service.getAll(this.filters()).subscribe({
      next: reqs => {
        this.allRequests.set(reqs);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateSearch(search: string) {
    this.filters.update(f => ({ ...f, search }));
    this.loadRequests();
  }

  setStatus(status: string) {
    this.filters.update(f => ({ ...f, status: status || undefined }));
    this.loadRequests();
  }

  updateSort(sortBy: string) {
    this.filters.update(f => ({ ...f, sortBy }));
    this.loadRequests();
  }

  openNewRequest() { this.router.navigate(['/requests/new']); }
  viewRequest(id: number) { this.router.navigate(['/requests', id]); }
  editRequest(id: number) { this.router.navigate(['/requests', id, 'edit']); }

  completeRequest(id: number) {
    const request = this.allRequests().find(r => r.id === id);
    if (!request) return;
    const dialogRef = this.dialog.open(CompletionDialogComponent, {
      width: '600px', maxWidth: '90vw', data: { request }, disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadRequests(); });
  }

  deleteRequest(id: number) {
    const request = this.allRequests().find(r => r.id === id);
    if (!request) return;
    if (!confirm(`Delete "${request.title}"?\n\nThis cannot be undone.`)) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Request deleted', 'Close', { duration: 3000 });
        this.loadRequests();
      },
      error: () => this.snackBar.open('Error deleting request', 'Close', { duration: 3000 })
    });
  }
}
