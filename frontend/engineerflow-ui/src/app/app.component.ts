import { Component, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { SignalRService } from './core/services/signalr.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private signalR = inject(SignalRService);

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