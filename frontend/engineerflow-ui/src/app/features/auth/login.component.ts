import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #0d1117;
      position: relative;
      overflow: hidden;
    }

    .blob {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
      animation: blob 8s infinite;
    }
    .blob-1 { background: #3b82f6; top: -60px; left: -60px; }
    .blob-2 { background: #6366f1; top: -60px; right: -60px; animation-delay: 2s; }
    .blob-3 { background: #2563eb; bottom: -80px; left: 80px; animation-delay: 4s; }

    @keyframes blob {
      0%, 100% { transform: translate(0,0) scale(1); }
      33% { transform: translate(20px,-30px) scale(1.05); }
      66% { transform: translate(-15px,15px) scale(0.95); }
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      position: relative;
      z-index: 1;
    }

    .brand-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 24px rgba(59,130,246,0.3);
    }

    .auth-title {
      font-size: 26px;
      font-weight: 700;
      color: #e6edf3;
      text-align: center;
      margin: 0 0 6px;
    }

    .auth-subtitle {
      font-size: 13px;
      color: #8b949e;
      text-align: center;
      margin: 0 0 32px;
    }

    .field-group {
      margin-bottom: 20px;
    }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #8b949e;
      margin-bottom: 8px;
    }

    .field-wrap {
      position: relative;
    }

    .field-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #6e7681;
      display: flex;
      align-items: center;
      pointer-events: none;
    }

    .auth-input {
      width: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 10px;
      padding: 12px 14px 12px 44px;
      font-size: 14px;
      color: #e6edf3;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
    }

    .auth-input::placeholder { color: #6e7681; }

    .auth-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
    }

    .auth-select {
      width: 100%;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 14px;
      color: #e6edf3;
      font-family: 'Inter', sans-serif;
      outline: none;
      cursor: pointer;
      appearance: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
    }

    .auth-select:focus { border-color: #3b82f6; }

    .auth-select option {
      background: #161b22;
      color: #e6edf3;
    }

    .submit-btn {
      width: 100%;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      padding: 13px 20px;
      font-size: 14px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
      margin-top: 8px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #2563eb;
      box-shadow: 0 4px 16px rgba(59,130,246,0.35);
      transform: translateY(-1px);
    }

    .submit-btn:active:not(:disabled) { transform: translateY(0); }

    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #21262d;
      text-align: center;
    }

    .auth-footer p { font-size: 13px; color: #6e7681; margin: 0 0 8px; }

    .auth-link {
      color: #3b82f6;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      transition: color 0.15s;
    }

    .auth-link:hover { color: #60a5fa; }

    .copyright {
      text-align: center;
      margin-top: 24px;
      font-size: 10px;
      color: #30363d;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  `],
  template: `
    <div class="auth-page">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <div>
        <div class="auth-card">
          <div class="brand-icon">
            <lucide-icon name="shield-check" [size]="32" style="color:white"></lucide-icon>
          </div>
          <h1 class="auth-title">EngineerFlow</h1>
          <p class="auth-subtitle">Secure enterprise engineering management</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="field-group">
              <label class="field-label">Username</label>
              <div class="field-wrap">
                <span class="field-icon">
                  <lucide-icon name="user" [size]="16"></lucide-icon>
                </span>
                <input type="text" formControlName="username" class="auth-input" placeholder="john.doe" autocomplete="username">
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="field-wrap">
                <span class="field-icon">
                  <lucide-icon name="lock" [size]="16"></lucide-icon>
                </span>
                <input type="password" formControlName="password" class="auth-input" placeholder="••••••••" autocomplete="current-password">
              </div>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading() || loginForm.invalid">
              <span *ngIf="!loading()">SIGN IN</span>
              <span *ngIf="loading()" style="display:flex;align-items:center;gap:8px">
                <div class="spinner"></div>
                AUTHENTICATING...
              </span>
              <lucide-icon *ngIf="!loading()" name="arrow-right" [size]="16"></lucide-icon>
            </button>
          </form>

          <div class="auth-footer">
            <p>New to the platform?</p>
            <a routerLink="/register" class="auth-link">Create Engineering Account</a>
          </div>
        </div>

        <p class="copyright">&copy; 2026 EngineerFlow Systems</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = signal(false);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.toastr.success('Welcome back!');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.toastr.error('Invalid credentials', 'Login Failed');
          this.loading.set(false);
        }
      });
    }
  }
}
