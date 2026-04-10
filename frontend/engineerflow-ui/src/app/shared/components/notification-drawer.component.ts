import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SignalRService } from '../../core/services/signalr.service';
import { Router } from '@angular/router';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'info' | 'warning' | 'success';
}

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="notification-wrapper">
      <button class="bell-btn" (click)="toggleDrawer()">
        <lucide-icon name="bell" size="20"></lucide-icon>
        @if(unreadCount() > 0) {
          <span class="badge">{{unreadCount()}}</span>
        }
      </button>

      @if(isOpen()) {
        <div class="drawer-dropdown">
          <div class="drawer-header">
            <h3>Notifications</h3>
            <button class="mark-all-btn" (click)="markAllAsRead()">Mark all read</button>
          </div>
          
          <div class="notification-list">
            @for(notif of notifications(); track notif.id) {
              <div class="notification-item" [class.unread]="!notif.isRead" (click)="readNotification(notif)">
                <div class="notif-icon" [ngClass]="notif.type">
                  @if(notif.type === 'warning') { <lucide-icon name="alert-triangle" size="16"></lucide-icon> }
                  @if(notif.type === 'success') { <lucide-icon name="check-circle" size="16"></lucide-icon> }
                  @if(notif.type === 'info')    { <lucide-icon name="info" size="16"></lucide-icon> }
                </div>
                <div class="notif-content">
                  <div class="notif-title">{{notif.title}}</div>
                  <div class="notif-msg">{{notif.message}}</div>
                  <div class="notif-time">{{notif.timestamp | date:'shortTime'}}</div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">No new notifications</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-wrapper {
      position: relative;
    }

    .bell-btn {
      position: relative;
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }
    
    .bell-btn:hover {
      background: rgba(255,255,255,0.05);
      color: var(--color-text-primary);
    }

    .badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 5px;
      border-radius: 10px;
    }

    .drawer-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      width: 320px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 100;
      overflow: hidden;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
      background: rgba(0,0,0,0.1);
    }

    .drawer-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .mark-all-btn {
      background: none;
      border: none;
      color: var(--color-accent);
      font-size: 12px;
      cursor: pointer;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      transition: var(--transition);
    }

    .notification-item:hover {
      background: rgba(255,255,255,0.02);
    }

    .notification-item.unread {
      background: rgba(59,130,246,0.05);
    }

    .notif-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .notif-icon.warning { background: #f59e0b; }
    .notif-icon.success { background: #10b981; }
    .notif-icon.info { background: #3b82f6; }

    .notif-content { flex: 1; }
    
    .notif-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--color-text-primary); }
    .notif-msg { font-size: 13px; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 6px; }
    .notif-time { font-size: 11px; color: var(--color-text-muted); }

    .empty-state {
      padding: 32px;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 13px;
    }

    @keyframes slideDown { 
      from { opacity: 0; transform: translateY(-10px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
  `]
})
export class NotificationDrawerComponent {
  isOpen = signal(false);
  notifications = signal<AppNotification[]>([]);
  private signalR = inject(SignalRService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const event = this.signalR.auditEntryCreated();
      if (event) {
        if (event.isFlagged) {
          this.addNotification({
            title: 'Wordwatch Alert',
            message: `Flagged action: ${event.action} on ${event.entityType}. ${event.flagReason}`,
            type: 'warning'
          });
        }
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const job = this.signalR.jobCreated();
      if (job) {
        this.addNotification({
          title: 'New Job Request',
          message: `${job.title} created by ${job.requesterName}`,
          type: 'info'
        });
      }
    }, { allowSignalWrites: true });
  }

  get unreadCount() {
    return signal(this.notifications().filter(n => !n.isRead).length);
  }

  toggleDrawer() {
    this.isOpen.set(!this.isOpen());
  }

  addNotification(data: {title: string, message: string, type: 'info'|'warning'|'success'}) {
    const list = this.notifications();
    this.notifications.set([{
      id: Math.random().toString(36),
      timestamp: new Date(),
      isRead: false,
      ...data
    }, ...list].slice(0, 20)); // keep last 20
  }

  readNotification(n: AppNotification) {
    this.notifications.update(list => list.map(x => x.id === n.id ? {...x, isRead: true} : x));
    if (n.title === 'Wordwatch Alert') this.router.navigate(['/audit']);
    else if (n.title === 'New Job Request') this.router.navigate(['/requests']);
    this.isOpen.set(false);
  }

  markAllAsRead() {
    this.notifications.update(list => list.map(x => ({...x, isRead: true})));
  }
}
