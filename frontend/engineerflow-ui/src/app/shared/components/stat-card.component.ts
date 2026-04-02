import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  template: `
    <mat-card class="stat-card" [class]="color">
      <div class="card-content">
        <div class="stat-header">
          <mat-icon class="stat-icon">{{ icon }}</mat-icon>
          @if (trend) {
            <div class="trend" [class]="trend.direction">
              <mat-icon class="trend-icon">{{ getTrendIcon() }}</mat-icon>
              <span class="trend-value">{{ trend.value }}%</span>
            </div>
          }
        </div>
        
        <div class="stat-value">{{ animatedValue }}</div>
        <div class="stat-label">{{ label }}</div>
        
        @if (subtitle) {
          <div class="stat-subtitle">{{ subtitle }}</div>
        }
      </div>
      
      <div class="card-accent"></div>
    </mat-card>
  `,
  styles: [`
    .stat-card {
      position: relative;
      overflow: hidden;
      transition: var(--transition-slow);
      cursor: pointer;
      border: 1px solid var(--color-border);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-elevated);
        
        .card-accent {
          height: 6px;
        }
      }
      
      &.primary .card-accent { background: var(--color-accent); }
      &.success .card-accent { background: var(--color-success); }
      &.warning .card-accent { background: var(--color-warning); }
      &.info .card-accent { background: #3b82f6; }
      &.danger .card-accent { background: var(--color-danger); }
    }
    
    .card-content {
      padding: 24px;
    }
    
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .stat-icon {
      color: var(--color-text-secondary);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
      
      &.up {
        color: var(--color-success);
        background: rgba(16,185,129,0.1);
      }
      
      &.down {
        color: var(--color-danger);
        background: rgba(239,68,68,0.1);
      }
      
      &.neutral {
        color: var(--color-text-secondary);
        background: rgba(107,114,128,0.1);
      }
      
      .trend-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 8px;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 14px;
      color: var(--color-text-secondary);
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .stat-subtitle {
      font-size: 12px;
      color: var(--color-text-muted);
    }
    
    .card-accent {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      transition: var(--transition);
    }
  `]
})
export class StatCardComponent implements OnInit {
  @Input() label = '';
  @Input() value = 0;
  @Input() color = 'primary';
  @Input() icon = 'analytics';
  @Input() subtitle = '';
  @Input() trend?: { value: number; direction: 'up' | 'down' | 'neutral' };

  animatedValue = 0;

  ngOnInit() {
    this.animateValue();
  }

  private animateValue() {
    const duration = 1200;
    const start = performance.now();
    const animate = (timestamp: number) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.animatedValue = Math.floor(this.value * easeOut);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  getTrendIcon(): string {
    if (!this.trend) return 'trending_flat';
    return this.trend.direction === 'up' ? 'trending_up' : 
           this.trend.direction === 'down' ? 'trending_down' : 'trending_flat';
  }
}