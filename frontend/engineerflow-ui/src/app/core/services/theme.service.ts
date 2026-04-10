import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'ef_theme_preference';
  
  // Track current mode
  public activeTheme = signal<ThemeMode>('system');
  public isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
    
    // Listen to system OS changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.activeTheme() === 'system') {
        this.applyThemeToBody(e.matches);
      }
    });
  }

  private initTheme() {
    const saved = localStorage.getItem(this.THEME_KEY) as ThemeMode;
    if (saved) {
      this.setTheme(saved);
    } else {
      this.setTheme('system');
    }
  }

  public setTheme(mode: ThemeMode) {
    this.activeTheme.set(mode);
    localStorage.setItem(this.THEME_KEY, mode);

    let isDark = false;
    if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = mode === 'dark';
    }
    
    this.applyThemeToBody(isDark);
  }

  private applyThemeToBody(isDark: boolean) {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.documentElement.classList.add('dark'); // for tailwind
    } else {
      document.body.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark');
    }
  }
}
