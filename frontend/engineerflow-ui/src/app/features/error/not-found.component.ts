import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg);
      padding: 24px;
    }

    .error-card {
      text-align: center;
      max-width: 500px;
    }

    .error-code {
      font-size: 120px;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1;
      margin: 0 0 16px;
    }

    .error-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 12px;
    }

    .error-message {
      font-size: 15px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0 0 32px;
    }

    .error-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      text-decoration: none;
    }

    .btn-primary {
      background: var(--color-accent);
      color: white;
      border: none;
    }
    .btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.06); }
  `],
  template: `
    <div class="error-page">
      <div class="error-card">
        <div class="error-code">404</div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-message">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <div class="error-actions">
          <a routerLink="/dashboard" class="btn btn-primary">
            <lucide-icon name="layout-dashboard" [size]="16"></lucide-icon>
            Go to Dashboard
          </a>
          <a routerLink="/requests" class="btn btn-secondary">
            <lucide-icon name="clipboard-list" [size]="16"></lucide-icon>
            View Requests
          </a>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
