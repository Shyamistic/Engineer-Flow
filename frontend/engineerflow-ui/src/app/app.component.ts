import { Component, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { SignalRService } from './core/services/signalr.service';
import { ThemeService } from './core/services/theme.service';
import { CommonModule } from '@angular/common';

import { CommandPaletteComponent } from './shared/components/command-palette.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CommandPaletteComponent],
  template: `
    <router-outlet></router-outlet>
    <app-command-palette></app-command-palette>
  `
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private signalR = inject(SignalRService);
  private theme = inject(ThemeService);

  constructor() {
    // Automatically manage SignalR connection based on auth state
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.token) {
        this.signalR.startConnection(user.token);
      } else {
        this.signalR.stopConnection();
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {}
}