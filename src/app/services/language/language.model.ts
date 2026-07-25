import { InjectionToken, makeStateKey } from '@angular/core';

export type AppLang = 'ru' | 'en';

export const DEFAULT_LANG: AppLang = 'ru';
export const LANG_STORAGE_KEY = 'cv_lang';
export const LANG_COOKIE_KEY = 'cv_lang';

/**
 * Язык, вычисленный Express-сервером из cookie/Accept-Language входящего запроса.
 * Без него SSR всегда рендерит `ru`, и браузер после гидрации перезагружает
 * переводы и повторяет все запросы к API уже с другим Accept-Language.
 */
export const SSR_LANG = new InjectionToken<AppLang>('SSR_LANG');

/**
 * Язык, на котором SSR отрендерил разметку и сложил данные в `TransferState`.
 * Браузер сверяет его со своим выбором: при расхождении серверные данные всё
 * равно нужны для гидрации, но после неё их надо перезапросить с новым
 * `Accept-Language`.
 */
export const SSR_LANG_STATE_KEY = makeStateKey<AppLang>('ssrLang');

export function isAppLang(value: string | null | undefined): value is AppLang {
  return value === 'ru' || value === 'en';
}

export function readLangFromCookieHeader(cookieHeader: string | undefined): AppLang | null {
  if (!cookieHeader) {
    return null;
  }
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE_KEY}=([^;]+)`));
  return isAppLang(match?.[1]) ? match[1] : null;
}

export function readLangFromAcceptLanguage(acceptLanguage: string | undefined): AppLang | null {
  if (!acceptLanguage) {
    return null;
  }
  const primary = acceptLanguage.split(',')[0]?.trim().toLowerCase() ?? '';
  if (primary.startsWith('en')) {
    return 'en';
  }
  if (primary.startsWith('ru')) {
    return 'ru';
  }
  return null;
}

/**
 * Порядок приоритета совпадает с браузерным `resolveInitialLang()`:
 * явный выбор пользователя (cookie) важнее языка браузера.
 */
export function resolveLangFromHeaders(
  cookieHeader: string | undefined,
  acceptLanguage: string | undefined,
): AppLang {
  return (
    readLangFromCookieHeader(cookieHeader) ?? readLangFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LANG
  );
}
