import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { Subject, firstValueFrom } from 'rxjs';
import {
  AppLang,
  DEFAULT_LANG,
  LANG_COOKIE_KEY,
  LANG_STORAGE_KEY,
  SSR_LANG,
  isAppLang,
} from './language.model';

export type { AppLang } from './language.model';

const STORAGE_KEY = LANG_STORAGE_KEY;
const COOKIE_KEY = LANG_COOKIE_KEY;

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private ssrLang = inject(SSR_LANG, { optional: true });

  readonly currentLang = signal<AppLang>(DEFAULT_LANG);
  readonly translationsReady = signal(false);
  private readonly langChangesSubject = new Subject<AppLang>();
  readonly langChanges$ = this.langChangesSubject.asObservable();

  init(): Promise<void> {
    const lang = isPlatformBrowser(this.platformId)
      ? this.resolveInitialLang()
      : (this.ssrLang ?? DEFAULT_LANG);
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
    return firstValueFrom(this.transloco.load(lang)).then(() => {
      this.currentLang.set(lang);
      this.transloco.setActiveLang(lang);
      this.translationsReady.set(true);
      // На сервере тоже проставляем, иначе SSR-разметка уедет с lang="ru".
      this.document.documentElement.lang = lang;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(STORAGE_KEY, lang);
        document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
      }
      if (notify) {
        this.langChangesSubject.next(lang);
      }
    });
  }

  private resolveInitialLang(): AppLang {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isAppLang(stored)) {
        return stored;
      }
      const cookieLang = this.readCookieLang();
      if (cookieLang) {
        return cookieLang;
      }
      const browser = navigator.language.toLowerCase();
      if (browser.startsWith('en')) {
        return 'en';
      }
    }
    return DEFAULT_LANG;
  }

  readCookieLang(): AppLang | null {
    if (!isPlatformBrowser(this.platformId)) {
      return this.ssrLang;
    }
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]+)`));
    return isAppLang(cookieMatch?.[1]) ? cookieMatch[1] : null;
  }
}
