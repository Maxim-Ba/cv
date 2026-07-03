import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { Subject, firstValueFrom } from 'rxjs';

export type AppLang = 'ru' | 'en';

const STORAGE_KEY = 'cv_lang';
const COOKIE_KEY = 'cv_lang';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);

  readonly currentLang = signal<AppLang>('ru');
  readonly translationsReady = signal(false);
  private readonly langChangesSubject = new Subject<AppLang>();
  readonly langChanges$ = this.langChangesSubject.asObservable();

  init(): Promise<void> {
    const lang = isPlatformBrowser(this.platformId)
      ? this.resolveInitialLang()
      : this.readCookieLang();
    return this.applyLang(lang, false);
  }

  setLang(lang: AppLang): void {
    if (lang === this.currentLang()) {
      return;
    }
    void this.applyLang(lang, true);
  }

  toggleLang(): void {
    this.setLang(this.currentLang() === 'ru' ? 'en' : 'ru');
  }

  private applyLang(lang: AppLang, notify: boolean): Promise<void> {
    this.currentLang.set(lang);
    this.translationsReady.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
      document.documentElement.lang = lang;
    }
    this.transloco.setActiveLang(lang);
    return firstValueFrom(this.transloco.load(lang)).then(() => {
      this.translationsReady.set(true);
      if (notify) {
        this.langChangesSubject.next(lang);
      }
    });
  }

  private resolveInitialLang(): AppLang {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY) as AppLang | null;
      if (stored === 'ru' || stored === 'en') {
        return stored;
      }
      const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]+)`));
      if (cookieMatch?.[1] === 'ru' || cookieMatch?.[1] === 'en') {
        return cookieMatch[1] as AppLang;
      }
      const browser = navigator.language.toLowerCase();
      if (browser.startsWith('en')) {
        return 'en';
      }
    }
    return 'ru';
  }

  readCookieLang(): AppLang {
    if (!isPlatformBrowser(this.platformId)) {
      return 'ru';
    }
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]+)`));
    if (cookieMatch?.[1] === 'en') {
      return 'en';
    }
    return 'ru';
  }
}
