import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
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
    .blob-1 { background: #6366f1; top: -60px; right: -60px; }
    .blob-2 { background: #3b82f6; top: -60px; left: -60px; animation-delay: 2s; }
    .blob-3 { background: #2563eb; bottom: -80px; right: 80px; animation-delay: 4s; }

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
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 24px rgba(99,102,241,0.3);
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
      margin-bottom: 18px;
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
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b949e' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
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
            <lucide-icon name="user-plus" [size]="32" style="color:white"></lucide-icon>
          </div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join the EngineerFlow ecosystem</p>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="field-group">
              <label class="field-label">Full Name</label>
              <div class="field-wrap">
                <span class="field-icon">
                  <lucide-icon name="user-check" [size]="16"></lucide-icon>
                </span>
                <input type="text" formControlName="fullName" class="auth-input" placeholder="Jane Doe" autocomplete="name">
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Username</label>
              <div class="field-wrap">
                <span class="field-icon">
                  <lucide-icon name="user" [size]="16"></lucide-icon>
                </span>
                <input type="text" formControlName="username" class="auth-input" placeholder="jane.doe" autocomplete="username">
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="field-wrap">
                <span class="field-icon">
                  <lucide-icon name="lock" [size]="16"></lucide-icon>
                </span>
                <input type="password" formControlName="password" class="auth-input" placeholder="Min. 6 characters" autocomplete="new-password">
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Engineering Role</label>
              <select formControlName="role" class="auth-select">
                <option [value]="0">Engineer</option>
                <option [value]="1">Admin</option>
              </select>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading() || registerForm.invalid">
              <span *ngIf="!loading()">CREATE ACCOUNT</span>
              <span *ngIf="loading()" style="display:flex;align-items:center;gap:8px">
                <div class="spinner"></div>
                CREATING...
              </span>
              <lucide-icon *ngIf="!loading()" name="arrow-right" [size]="16"></lucide-icon>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account?</p>
            <a routerLink="/login" class="auth-link">Sign In to System</a>
          </div>
        </div>

        <p class="copyright">&copy; 2026 EngineerFlow Systems</p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = signal(false);

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required]],
    role: [0, [Validators.required]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading.set(true);
      const payload = {
        ...this.registerForm.value,
        role: Number(this.registerForm.value.role)
      };
      this.authService.register(payload).subscribe({
        next: () => {
          this.toastr.success('Account created successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.toastr.error(err.error?.error || 'Registration failed', 'Error');
          this.loading.set(false);
        }
      });
    }
  }
}
