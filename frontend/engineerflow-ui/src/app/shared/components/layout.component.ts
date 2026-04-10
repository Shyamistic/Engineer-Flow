import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { NotificationDrawerComponent } from './notification-drawer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, NotificationDrawerComponent],
  template: `
    <div class="app-shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-left">
            <div class="brand-icon">
              <lucide-icon name="clipboard-list" size="22" class="text-white"></lucide-icon>
            </div>
            <span class="brand-name">EngineerFlow</span>
          </div>
          <app-notification-drawer></app-notification-drawer>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="nav-active"
             class="nav-item">
            <lucide-icon name="layout-dashboard" size="20"></lucide-icon>
            <span>Dashboard</span>
          </a>
          <a routerLink="/requests" routerLinkActive="nav-active"
             class="nav-item">
            <lucide-icon name="clipboard-list" size="20"></lucide-icon>
            <span>Job Requests</span>
          </a>
          <a routerLink="/jobs" routerLinkActive="nav-active"
             class="nav-item">
            <lucide-icon name="activity" size="20"></lucide-icon>
            <span>Job Board</span>
          </a>
          <a routerLink="/audit" routerLinkActive="nav-active"
             class="nav-item nav-audit">
            <lucide-icon name="shield-check" size="20"></lucide-icon>
            <span>Audit Trail</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <!-- Theme Toggle -->
          <div class="theme-toggle">
            <button class="theme-btn" [class.active]="themeService.activeTheme() === 'light'" (click)="themeService.setTheme('light')" title="Light Mode">
              <lucide-icon name="sun" size="18"></lucide-icon>
            </button>
            <button class="theme-btn" [class.active]="themeService.activeTheme() === 'system'" (click)="themeService.setTheme('system')" title="System Match">
              <lucide-icon name="monitor" size="18"></lucide-icon>
            </button>
            <button class="theme-btn" [class.active]="themeService.activeTheme() === 'dark'" (click)="themeService.setTheme('dark')" title="Dark Mode">
              <lucide-icon name="moon" size="18"></lucide-icon>
            </button>
          </div>

          <div class="user-card">
            <div class="user-avatar">
              {{ authService.currentUser()?.username?.[0]?.toUpperCase() }}
            </div>
            <div class="user-info">
              <div class="user-name">{{ authService.currentUser()?.username }}</div>
              <div class="user-role">{{ authService.currentUser()?.role }}</div>
            </div>
            <button (click)="logout()" class="logout-btn" title="Sign out">
              <lucide-icon name="log-out" size="18"></lucide-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--color-bg);
    }

    .sidebar {
      width: 260px;
      min-width: 260px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid var(--color-border);
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--color-accent), #6366f1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59,130,246,0.3);
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      letter-spacing: -0.3px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 10px;
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: var(--transition);
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.06);
      color: var(--color-text-primary);
    }

    .nav-item.nav-active {
      background: rgba(59,130,246,0.15);
      color: var(--color-accent);
      font-weight: 600;
    }

    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .theme-toggle {
      display: flex;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
    }

    .theme-btn {
      flex: 1;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: 6px;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .theme-btn:hover {
      color: var(--color-text-primary);
    }

    .theme-btn.active {
      background: rgba(255,255,255,0.08);
      color: var(--color-accent);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      border: 1px solid var(--color-border);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--color-accent), #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: capitalize;
    }

    .logout-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: var(--transition);
    }

    .logout-btn:hover {
      color: #ef4444;
      background: rgba(239,68,68,0.1);
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    .main-content::-webkit-scrollbar {
      width: 6px;
    }

    .main-content::-webkit-scrollbar-track {
      background: transparent;
    }

    .main-content::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 3px;
    }
  `]
})
export class LayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  logout() {
    this.authService.logout();
  }
}
