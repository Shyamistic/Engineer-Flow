import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobRequest } from '../../core/models/job-request.model';

@Component({
  selector: 'app-request-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="request-row">
      <div class="row-left">
        <div class="status-dot" [class]="request.statusLabel.toLowerCase()"></div>
        <div class="request-info">
          <div class="title">{{ request.title }}</div>
          <div class="meta">Updated {{ relativeTime(request.updatedAt) }}</div>
        </div>
      </div>
      <div class="row-right">
        <span class="priority-badge" [class]="request.priorityLabel.toLowerCase()">{{ request.priorityLabel }}</span>
      </div>
    </div>
  `,
  styles: [`
    .request-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: 8px;
      transition: var(--transition);
    }

    .request-row:hover {
      border-color: var(--color-accent);
    }

    .row-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.open { background: var(--status-open); }
    .status-dot.inprogress { background: var(--status-inprogress); }
    .status-dot.onhold { background: var(--status-onhold); }
    .status-dot.completed { background: var(--status-completed); }
    .status-dot.cancelled { background: var(--status-cancelled); }

    .request-info {
      flex: 1;
    }

    .title {
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }

    .meta {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .priority-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-badge.low { background: rgba(100,116,139,0.15); color: var(--priority-low); }
    .priority-badge.medium { background: rgba(59,130,246,0.15); color: var(--priority-medium); }
    .priority-badge.high { background: rgba(245,158,11,0.15); color: var(--priority-high); }
    .priority-badge.critical { background: rgba(239,68,68,0.15); color: var(--priority-critical); }
  `]
})
export class RequestRowComponent {
  @Input() request!: JobRequest;

  relativeTime(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }
}