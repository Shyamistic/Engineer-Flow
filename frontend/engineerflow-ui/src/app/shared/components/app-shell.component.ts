import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { JobRequestService } from '../../core/services/job-request.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule
  ],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <mat-icon>engineering</mat-icon>
            </div>
            <div class="logo-text">
              <h2>EngineerFlow</h2>
              <span class="tagline">Request Management</span>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
            <div class="nav-indicator"></div>
          </a>
          
          <a routerLink="/requests" routerLinkActive="active" class="nav-item">
            <mat-icon>assignment</mat-icon>
            <span>All Requests</span>
            <span class="badge" *ngIf="summary()?.total">{{ summary()?.total }}</span>
            <div class="nav-indicator"></div>
          </a>
          
          <div class="nav-divider"></div>
          
          <a routerLink="/requests/new" class="nav-item create-btn">
            <mat-icon>add_circle</mat-icon>
            <span>New Request</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <div class="quick-stats" *ngIf="summary()">
            <div class="stat-item">
              <span class="stat-value">{{ summary()?.open || 0 }}</span>
              <span class="stat-label">Open</span>
            </div>
            <div class="stat-item">
              <span class="stat-value critical" *ngIf="summary()?.critical">{{ summary()?.critical }}</span>
              <span class="stat-label" *ngIf="summary()?.critical">Critical</span>
            </div>
          </div>
          <div class="version-info">
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
      
      <main class="main-content">
        <header class="top-bar">
          <div class="breadcrumb">
            <mat-icon class="breadcrumb-icon">home</mat-icon>
            <span>{{ getCurrentPageTitle() }}</span>
          </div>
          
          <div class="header-actions">
            <button mat-icon-button class="action-btn" title="Notifications">
              <mat-icon [matBadge]="summary()?.overdue || 0" 
                       [matBadgeHidden]="!summary()?.overdue"
                       matBadgeColor="warn">notifications</mat-icon>
            </button>
            
            <button mat-icon-button class="action-btn" title="Settings">
              <mat-icon>settings</mat-icon>
            </button>
          </div>
        </header>
        
        <div class="content-area">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      background: var(--color-bg);
    }

    .sidebar {
      width: 280px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 100;
    }

    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid var(--color-border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--color-accent), #7c3aed);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 16px rgba(59,130,246,0.3);
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .logo-text h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1.2;
    }

    .tagline {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-weight: 400;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: var(--transition);
      position: relative;
      margin: 2px 12px;
      border-radius: var(--radius-md);
      font-weight: 500;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .badge {
        margin-left: auto;
        background: var(--color-accent);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }

      .nav-indicator {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: var(--color-accent);
        border-radius: 0 2px 2px 0;
        transition: var(--transition);
      }

      &:hover {
        background: rgba(59,130,246,0.1);
        color: var(--color-text-primary);
        
        .nav-indicator {
          height: 20px;
        }
      }

      &.active {
        background: rgba(59,130,246,0.15);
        color: var(--color-accent);
        
        .nav-indicator {
          height: 32px;
        }
      }

      &.create-btn {
        background: var(--color-accent);
        color: white;
        margin: 16px 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(59,130,246,0.3);

        &:hover {
          background: #2563eb;
          box-shadow: 0 4px 16px rgba(59,130,246,0.4);
          transform: translateY(-1px);
        }
      }
    }

    .nav-divider {
      height: 1px;
      background: var(--color-border);
      margin: 16px 20px;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid var(--color-border);
    }

    .quick-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-item {
      text-align: center;
      flex: 1;
    }

    .stat-value {
      display: block;
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      
      &.critical {
        color: var(--priority-critical);
      }
    }

    .stat-label {
      font-size: 11px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .version-info {
      text-align: center;
      color: var(--color-text-muted);
      font-size: 11px;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .top-bar {
      height: 72px;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      font-size: 16px;
      color: var(--color-text-primary);
    }

    .breadcrumb-icon {
      color: var(--color-text-secondary);
      font-size: 18px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      color: var(--color-text-secondary);
      
      &:hover {
        color: var(--color-text-primary);
        background: rgba(59,130,246,0.1);
      }
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      background: var(--color-bg);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 240px;
      }
      
      .content-area {
        padding: 16px;
      }
      
      .top-bar {
        padding: 0 16px;
      }
    }
  `]
})
export class AppShellComponent {
  private router = inject(Router);
  private service = inject(JobRequestService);
  
  summary = signal<any>(null);

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.service.getSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (error) => console.error('Error loading summary:', error)
    });
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/requests/new')) return 'New Request';
    if (url.includes('/requests/')) return 'Request Details';
    if (url.includes('/requests')) return 'All Requests';
    return 'EngineerFlow';
  }
}