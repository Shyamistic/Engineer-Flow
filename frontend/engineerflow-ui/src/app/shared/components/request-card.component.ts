import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JobRequest, RequestStatus, Priority } from '../../core/models/job-request.model';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  template: `
    <div class="request-card clickable" 
         [class.overdue]="request.isOverdue"
         [class.critical]="request.priority === Priority.Critical">
      
      <!-- Priority indicator bar -->
      <div class="priority-bar" [class]="getPriorityClass()"></div>
      
      <div class="card-header">
        <div class="badges">
          <span class="badge priority" [class]="getPriorityClass()">{{ request.priorityLabel }}</span>
          <span class="badge status" [class]="getStatusClass()">{{ request.statusLabel }}</span>
        </div>
        
        <div class="card-actions">
          <button mat-icon-button 
                  class="action-btn"
                  [matMenuTriggerFor]="menu"
                  (click)="$event.stopPropagation()"
                  matTooltip="Actions">
            <mat-icon>more_vert</mat-icon>
          </button>
          
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="editRequest()">
              <mat-icon>edit</mat-icon>
              <span>Edit</span>
            </button>
            <button mat-menu-item (click)="completeRequest($event)" 
                    *ngIf="request.status !== RequestStatus.Completed">
              <mat-icon>check_circle</mat-icon>
              <span>Mark Complete</span>
            </button>
            <button mat-menu-item (click)="deleteRequest()">
              <mat-icon>delete</mat-icon>
              <span>Delete</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-title">{{ request.title }}</h3>
        <p class="card-description">{{ request.description }}</p>
        
        <div class="card-meta">
          <div class="meta-item" *ngIf="request.category">
            <mat-icon class="meta-icon">category</mat-icon>
            <span>{{ request.category }}</span>
          </div>
          
          <div class="meta-item" *ngIf="request.dueDate">
            <mat-icon class="meta-icon" [class.overdue]="request.isOverdue">schedule</mat-icon>
            <span [class.overdue]="request.isOverdue">{{ formatDate(request.dueDate) }}</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="assignee-info">
          <div class="avatar" [style.background]="getAvatarColor(request.requesterName)">
            {{ getInitials(request.requesterName) }}
          </div>
          <div class="assignee-details">
            <div class="requester-name">{{ request.requesterName }}</div>
            <div class="assigned-to" *ngIf="request.assignedTo">
              <mat-icon class="assigned-icon">person</mat-icon>
              {{ request.assignedTo }}
            </div>
          </div>
        </div>
        
        <div class="time-info">
          <div class="created-time" matTooltip="Created {{ formatDateTime(request.createdAt) }}">
            {{ getRelativeTime(request.createdAt) }}
          </div>
        </div>
      </div>
      
      <!-- Overdue indicator -->
      <div class="overdue-indicator" *ngIf="request.isOverdue">
        <mat-icon>warning</mat-icon>
        <span>OVERDUE</span>
      </div>
      
      <!-- Completion indicator -->
      <div class="completion-indicator" *ngIf="request.status === RequestStatus.Completed">
        <mat-icon>check_circle</mat-icon>
      </div>
    </div>
  `,
  styles: [`
    .request-card {
      position: relative;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 0;
      overflow: hidden;
      transition: var(--transition-slow);
      cursor: pointer;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-elevated);
        border-color: rgba(59,130,246,0.4);
        
        .priority-bar {
          height: 6px;
        }
        
        .action-btn {
          opacity: 1;
        }
      }
      
      &.critical {
        animation: pulse-critical 3s infinite;
      }
      
      &.overdue {
        border-color: var(--color-danger);
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-danger);
          animation: danger-pulse 2s infinite;
        }
      }
    }
    
    @keyframes pulse-critical {
      0%, 100% { box-shadow: var(--shadow-card); }
      50% { box-shadow: 0 4px 32px rgba(239,68,68,0.2); }
    }
    
    @keyframes danger-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .priority-bar {
      height: 3px;
      transition: var(--transition);
      
      &.low { background: var(--priority-low); }
      &.medium { background: var(--priority-medium); }
      &.high { background: var(--priority-high); }
      &.critical { background: var(--priority-critical); }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 20px 0;
    }

    .badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .card-actions {
      .action-btn {
        opacity: 0;
        transition: var(--transition);
        color: var(--color-text-secondary);
        
        &:hover {
          color: var(--color-text-primary);
          background: rgba(59,130,246,0.1);
        }
      }
    }

    .card-content {
      padding: 16px 20px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 12px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-description {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--color-text-secondary);
      
      .meta-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        
        &.overdue {
          color: var(--color-danger);
        }
      }
      
      span.overdue {
        color: var(--color-danger);
        font-weight: 600;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 20px;
      border-top: 1px solid var(--color-border);
      background: rgba(255,255,255,0.02);
    }

    .assignee-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: white;
      border: 2px solid var(--color-border);
    }

    .assignee-details {
      .requester-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 2px;
      }
      
      .assigned-to {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--color-text-secondary);
        
        .assigned-icon {
          font-size: 12px;
          width: 12px;
          height: 12px;
        }
      }
    }

    .time-info {
      text-align: right;
      
      .created-time {
        font-size: 11px;
        color: var(--color-text-muted);
        font-family: 'JetBrains Mono', monospace;
      }
    }

    .overdue-indicator {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--color-danger);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
      animation: pulse 2s infinite;
      
      mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }
    }
    
    .completion-indicator {
      position: absolute;
      top: 12px;
      right: 12px;
      color: var(--color-success);
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class RequestCardComponent {
  @Input() request!: JobRequest;
  @Output() complete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  RequestStatus = RequestStatus;
  Priority = Priority;

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getPriorityClass(): string {
    return this.request.priorityLabel.toLowerCase();
  }

  getStatusClass(): string {
    return this.request.statusLabel.toLowerCase().replace(' ', '');
  }

  formatDate(date?: string): string {
    if (!date) return 'No due date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }

  getRelativeTime(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  }

  completeRequest(event: Event) {
    event.stopPropagation();
    this.complete.emit(this.request.id);
  }

  editRequest() {
    this.edit.emit(this.request.id);
  }

  deleteRequest() {
    this.delete.emit(this.request.id);
  }
}