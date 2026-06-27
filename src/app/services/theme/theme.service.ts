import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export const THEME_STORAGE_KEY = 'cv-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isDarkMode = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
    }
  }

  init(): void {
    this.applyTheme(this.resolveIsDark());
    this.watchSystemTheme();
  }

  setDarkMode(isDark: boolean): void {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private resolveIsDark(): boolean {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === 'dark') {
      return true;
    }

    if (saved === 'light') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.document.body.classList.toggle('theme-dark', isDark);
  }

  private watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (event) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        this.applyTheme(event.matches);
      }
    });
  }
}
