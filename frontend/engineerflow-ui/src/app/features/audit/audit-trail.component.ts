import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { SignalRService } from '../../core/services/signalr.service';
import { AuditTrailEntry, AuditFilters } from '../../core/models/job-request.model';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <span class="shield-icon">🛡️</span>
            Audit Trail
          </h1>
          <p class="page-subtitle">Complete tamper-proof log of all system actions</p>
        </div>
        <div class="header-right">
          <div class="live-badge" [class.live-active]="isLive()">
            <span class="live-dot"></span>
            {{ isLive() ? 'LIVE' : 'OFFLINE' }}
          </div>
          <button class="export-btn" (click)="exportCsv()" title="Download as CSV">
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar" *ngIf="stats()">
        <div class="stat-card">
          <div class="stat-value">{{ stats()!.totalEvents | number }}</div>
          <div class="stat-label">Total Events</div>
        </div>
        <div class="stat-card highlight-24h">
          <div class="stat-value">{{ stats()!.last24hEvents }}</div>
          <div class="stat-label">Last 24 Hours</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats()!.last7dEvents }}</div>
          <div class="stat-label">Last 7 Days</div>
        </div>
        <div class="stat-card">
          <div class="stat-value truncate">{{ stats()!.topUser }}</div>
          <div class="stat-label">Most Active User</div>
        </div>
        <div class="stat-card total-count">
          <div class="stat-value">{{ result()?.total ?? 0 | number }}</div>
          <div class="stat-label">Filtered Results</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            class="search-input"
            type="text"
            placeholder="Search details, users, entities…"
            [(ngModel)]="searchText"
            (input)="onSearchChange()"
            id="audit-search"
          />
        </div>

        <select class="filter-select" [(ngModel)]="filters.action" (change)="applyFilters()" id="audit-action-filter">
          <option value="">All Actions</option>
          <option *ngFor="let a of actionTypes()" [value]="a">{{ a }}</option>
        </select>

        <select class="filter-select" [(ngModel)]="filters.entityType" (change)="applyFilters()" id="audit-entity-filter">
          <option value="">All Entities</option>
          <option value="JobRequest">Job Request</option>
          <option value="User">User</option>
        </select>

        <input
          class="filter-input"
          type="date"
          [(ngModel)]="filters.from"
          (change)="applyFilters()"
          title="From date"
          id="audit-from-date"
        />
        <input
          class="filter-input"
          type="date"
          [(ngModel)]="filters.to"
          (change)="applyFilters()"
          title="To date"
          id="audit-to-date"
        />

        <label class="flag-toggle">
          <input type="checkbox" [(ngModel)]="filters.isFlagged" (change)="applyFilters()">
          <span class="shield-check">🛡️ Flags Only</span>
        </label>

        <button class="clear-btn" (click)="clearFilters()" *ngIf="hasActiveFilters()">
          ✕ Clear Filters
        </button>
      </div>

      <!-- Live Feed Notice -->
      <div class="live-notice" *ngIf="liveCount() > 0">
        <span class="pulse-dot"></span>
        {{ liveCount() }} new event{{ liveCount() > 1 ? 's' : '' }} received live — scroll up or
        <button class="refresh-link" (click)="applyFilters()">refresh list</button>
      </div>

      <!-- Audit Table -->
      <div class="table-container" *ngIf="!loading(); else loadingTpl">
        <div class="table-empty" *ngIf="!entries().length">
          <div class="empty-icon">📋</div>
          <p>No audit events match your filters.</p>
        </div>

        <table class="audit-table" *ngIf="entries().length">
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>Actor</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of entries()" [class]="'row-' + entry.action.toLowerCase()" id="audit-row-{{ entry.id }}">
              <td class="id-cell">{{ entry.id }}</td>
              <td class="time-cell">
                <div class="time-main">{{ entry.timestamp | date:'MMM d, y' }}</div>
                <div class="time-sub">{{ entry.timestamp | date:'HH:mm:ss' }}</div>
              </td>
              <td>
                <span class="action-chip" [class]="'action-' + entry.action.toLowerCase()">
                  {{ getActionIcon(entry.action) }} {{ entry.action }}
                </span>
              </td>
              <td class="entity-cell">
                <div class="entity-type">{{ entry.entityType }}</div>
                <div class="entity-title" *ngIf="entry.entityTitle">{{ entry.entityTitle }}</div>
                <div class="entity-id" *ngIf="entry.entityId">#{{ entry.entityId }}</div>
              </td>
              <td class="details-cell">
                {{ entry.details }}
                <div *ngIf="entry.isFlagged" class="flag-reason">
                  🚨 <strong>Wordwatch Flag:</strong> {{ entry.flagReason }}
                </div>
              </td>
              <td class="user-cell">
                <div class="user-avatar-sm">{{ (entry.user || 'S')[0].toUpperCase() }}</div>
                <span>{{ entry.user }}</span>
              </td>
              <td class="ip-cell">{{ entry.ipAddress || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="result() && result()!.totalPages > 1">
        <button
          class="page-btn"
          [disabled]="currentPage() === 1"
          (click)="goToPage(currentPage() - 1)"
          id="audit-prev-page"
        >← Prev</button>

        <span class="page-info">
          Page {{ currentPage() }} of {{ result()!.totalPages }}
          ({{ result()!.total | number }} total events)
        </span>

        <button
          class="page-btn"
          [disabled]="currentPage() === result()!.totalPages"
          (click)="goToPage(currentPage() + 1)"
          id="audit-next-page"
        >Next →</button>
      </div>

      <ng-template #loadingTpl>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading audit trail…</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .audit-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--color-text-primary);
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .shield-icon { font-size: 26px; }

    .page-subtitle {
      color: var(--color-text-muted);
      font-size: 13px;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .live-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      background: rgba(100,116,139,0.15);
      color: var(--color-text-muted);
      border: 1px solid rgba(100,116,139,0.2);
      transition: all 0.3s;
    }

    .live-badge.live-active {
      background: rgba(16,185,129,0.12);
      color: #34d399;
      border-color: rgba(16,185,129,0.3);
      box-shadow: 0 0 12px rgba(16,185,129,0.1);
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    .live-badge.live-active .live-dot {
      animation: pulse-dot 1.5s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.7); }
    }

    .export-btn {
      padding: 9px 18px;
      background: rgba(59,130,246,0.12);
      color: var(--color-accent);
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }

    .export-btn:hover { background: rgba(59,130,246,0.2); }

    /* Stats Bar */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      text-align: center;
    }

    .stat-card.highlight-24h {
      border-color: rgba(59,130,246,0.3);
      background: rgba(59,130,246,0.05);
    }

    .stat-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--color-text-primary);
      line-height: 1;
      margin-bottom: 6px;
    }

    .stat-value.truncate {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stat-label {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 16px;
    }

    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 220px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
    }

    .search-input {
      width: 100%;
      padding: 9px 12px 9px 36px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-primary);
      font-size: 13px;
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .filter-select, .filter-input {
      padding: 9px 12px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-primary);
      font-size: 13px;
      cursor: pointer;
    }

    .filter-select:focus, .filter-input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .clear-btn {
      padding: 9px 14px;
      background: rgba(239,68,68,0.1);
      color: #f87171;
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--radius-sm);
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
    }

    .clear-btn:hover { background: rgba(239,68,68,0.2); }

    /* Live Notice */
    .live-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
      font-size: 13px;
      color: #34d399;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34d399;
      animation: pulse-dot 1s infinite;
      flex-shrink: 0;
    }

    .refresh-link {
      background: none;
      border: none;
      color: #34d399;
      text-decoration: underline;
      cursor: pointer;
      font-size: 13px;
      padding: 0;
    }

    /* Table */
    .table-container {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .table-empty {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-text-muted);
    }

    .empty-icon { font-size: 42px; margin-bottom: 12px; }

    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .audit-table thead tr {
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid var(--color-border);
    }

    .audit-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .audit-table tbody tr {
      border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: background 0.15s;
    }

    .audit-table tbody tr:last-child { border-bottom: none; }
    .audit-table tbody tr:hover { background: rgba(255,255,255,0.02); }

    .audit-table td {
      padding: 12px 16px;
      vertical-align: middle;
    }

    /* Row action color accents */
    .row-created { border-left: 3px solid rgba(96,165,250,0.4); }
    .row-updated { border-left: 3px solid rgba(251,191,36,0.4); }
    .row-deleted { border-left: 3px solid rgba(248,113,113,0.4); }
    .row-completed { border-left: 3px solid rgba(52,211,153,0.4); }
    .row-fileuploaded { border-left: 3px solid rgba(168,85,247,0.4); }
    .row-statuschanged { border-left: 3px solid rgba(251,191,36,0.3); }

    .audit-table tbody tr:has(.flag-reason) {
      background: rgba(239, 68, 68, 0.05);
      border-left: 3px solid rgba(239, 68, 68, 0.8) !important;
    }

    .flag-reason {
      margin-top: 6px;
      font-size: 11px;
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .flag-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: #ef4444;
      transition: var(--transition);
    }
    .flag-toggle:hover { background: rgba(239, 68, 68, 0.15); }
    .flag-toggle input { cursor: pointer; }

    .id-cell {
      color: var(--color-text-muted);
      font-family: monospace;
      font-size: 11px;
    }

    .time-cell { white-space: nowrap; }
    .time-main { font-size: 13px; color: var(--color-text-primary); }
    .time-sub { font-size: 11px; color: var(--color-text-muted); font-family: monospace; }

    /* Action chips */
    .action-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }

    .action-created { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .action-updated { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .action-deleted { background: rgba(248,113,113,0.12); color: #f87171; }
    .action-completed { background: rgba(52,211,153,0.12); color: #34d399; }
    .action-fileuploaded { background: rgba(168,85,247,0.12); color: #c084fc; }
    .action-statuschanged { background: rgba(251,191,36,0.1); color: #fbbf24; }

    .entity-cell { min-width: 140px; }
    .entity-type {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-muted);
      margin-bottom: 2px;
    }
    .entity-title { font-size: 13px; color: var(--color-text-primary); font-weight: 500; }
    .entity-id { font-size: 11px; color: var(--color-text-muted); font-family: monospace; }

    .details-cell {
      max-width: 300px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }

    .user-avatar-sm {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: linear-gradient(135deg, var(--color-accent), #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .ip-cell {
      font-family: monospace;
      font-size: 11px;
      color: var(--color-text-muted);
    }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      padding: 12px 0;
    }

    .page-btn {
      padding: 8px 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-primary);
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition);
    }

    .page-btn:hover:not(:disabled) { background: rgba(59,130,246,0.1); border-color: var(--color-accent); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .page-info {
      font-size: 13px;
      color: var(--color-text-muted);
    }

    /* Loading */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px;
      color: var(--color-text-muted);
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 12px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .stats-bar { grid-template-columns: repeat(2, 1fr); }
      .audit-table { font-size: 12px; }
      .audit-table th, .audit-table td { padding: 8px 10px; }
      .details-cell { max-width: 150px; }
    }
  `]
})
export class AuditTrailComponent implements OnInit, OnDestroy {
  private auditService = inject(AuditService);
  private signalR = inject(SignalRService);

  entries = signal<AuditTrailEntry[]>([]);
  result = signal<any>(null);
  stats = signal<any>(null);
  actionTypes = signal<string[]>([]);
  loading = signal(true);
  isLive = signal(false);
  liveCount = signal(0);
  currentPage = signal(1);

  filters: AuditFilters = {};
  searchText = '';
  private searchTimeout: any;

  private liveEffect = effect(() => {
    const entry = this.signalR.auditEntryCreated();
    if (entry && entry.id) {
      this.liveCount.update(c => c + 1);
    }
  });

  private connectionEffect = effect(() => {
    const status = this.signalR.connectionStatus();
    this.isLive.set(status === 'Connected');
  });

  ngOnInit() {
    this.loadActionTypes();
    this.loadStats();
    this.applyFilters();
  }

  ngOnDestroy() {
    clearTimeout(this.searchTimeout);
  }

  loadActionTypes() {
    this.auditService.getActionTypes().subscribe(types => this.actionTypes.set(types));
  }

  loadStats() {
    this.auditService.getStats().subscribe(s => this.stats.set(s));
  }

  applyFilters(page = 1) {
    this.currentPage.set(page);
    this.liveCount.set(0);
    this.loading.set(true);
    this.auditService.getAuditTrail({
      ...this.filters,
      search: this.searchText || undefined,
      page,
      pageSize: 50
    }).subscribe({
      next: data => {
        this.result.set(data);
        this.entries.set(data.items);
        this.loading.set(false);
        this.loadStats();
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 400);
  }

  goToPage(page: number) {
    this.applyFilters(page);
  }

  clearFilters() {
    this.filters = {};
    this.searchText = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.action || this.filters.entityType || this.filters.from || this.filters.to || this.searchText || this.filters.isFlagged);
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      Created: '✨', Updated: '✏️', Deleted: '🗑️',
      Completed: '✅', FileUploaded: '📎', StatusChanged: '🔄'
    };
    return icons[action] ?? '📌';
  }

  exportCsv() {
    this.auditService.exportToCsv(this.entries());
  }
}
