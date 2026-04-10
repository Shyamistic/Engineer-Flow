import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if(isOpen()) {
      <div class="palette-backdrop" (click)="close()">
        <div class="palette-container" (click)="$event.stopPropagation()">
          <div class="search-bar">
            <lucide-icon name="search" size="20" class="text-muted"></lucide-icon>
            <input #searchInput type="text" [(ngModel)]="query" (ngModelChange)="onSearch()" placeholder="Type a command or search..." autofocus>
            <div class="shortcut-hint">ESC</div>
          </div>
          
          <div class="results-container">
            @if(filteredCommands().length > 0) {
              <div class="results-group">
                <div class="group-title">Navigation</div>
                @for(cmd of filteredCommands(); track cmd.id) {
                  <div class="result-item" (click)="executeCommand(cmd)">
                    <lucide-icon [name]="cmd.icon" size="18"></lucide-icon>
                    <span class="cmd-title">{{cmd.title}}</span>
                    <span class="cmd-shortcut" *ngIf="cmd.shortcut">{{cmd.shortcut}}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="no-results">No commands found for '{{query()}}'</div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .palette-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 10vh;
      animation: fadeIn 0.15s ease-out;
    }

    .palette-container {
      width: 100%;
      max-width: 600px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      overflow: hidden;
      animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .search-bar {
      display: flex;
      align-items: center;
      padding: 0 20px;
      height: 60px;
      border-bottom: 1px solid var(--color-border);
      gap: 12px;
    }

    .search-bar input {
      flex: 1;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: var(--color-text-primary);
      font-size: 18px;
    }

    .text-muted {
      color: var(--color-text-muted);
    }

    .shortcut-hint {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      background: rgba(255,255,255,0.05);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--color-border);
    }

    .results-container {
      max-height: 400px;
      overflow-y: auto;
      padding: 12px 0;
    }

    .results-group {
      padding: 0 8px;
    }

    .group-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--color-text-muted);
      padding: 8px 12px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .result-item:hover, .result-item.active {
      background: rgba(59,130,246,0.1);
      color: var(--color-accent);
    }

    .cmd-title {
      flex: 1;
      font-weight: 500;
    }

    .cmd-shortcut {
      font-size: 12px;
      background: rgba(255,255,255,0.05);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .no-results {
      padding: 32px;
      text-align: center;
      color: var(--color-text-muted);
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { 
      from { opacity: 0; transform: translateY(-20px) scale(0.95); } 
      to { opacity: 1; transform: translateY(0) scale(1); } 
    }
  `]
})
export class CommandPaletteComponent {
  isOpen = signal(false);
  query = signal('');
  private router = inject(Router);

  commands = [
    { id: 'home', title: 'Go to Dashboard', path: '/dashboard', icon: 'layout-dashboard', shortcut: '' },
    { id: 'jobs', title: 'Go to Job List', path: '/requests', icon: 'clipboard-list', shortcut: '' },
    { id: 'board', title: 'Go to Kanban Board', path: '/jobs', icon: 'activity', shortcut: '' },
    { id: 'audit', title: 'Go to Audit Trail', path: '/audit', icon: 'shield-check', shortcut: '' }
  ];

  filteredCommands = signal(this.commands);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.isOpen.set(true);
      setTimeout(() => document.querySelector<HTMLInputElement>('.search-bar input')?.focus(), 50);
    } else if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  }

  onSearch() {
    const term = this.query().toLowerCase();
    if (!term) {
      this.filteredCommands.set(this.commands);
    } else {
      this.filteredCommands.set(this.commands.filter(c => c.title.toLowerCase().includes(term)));
    }
  }

  executeCommand(cmd: any) {
    this.router.navigate([cmd.path]);
    this.close();
  }

  close() {
    this.isOpen.set(false);
    this.query.set('');
    this.filteredCommands.set(this.commands);
  }
}
