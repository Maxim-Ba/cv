import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, concat, of, tap } from 'rxjs';
import { LanguageService } from '../services/language/language.service';
import { SSR_LANG_STATE_KEY } from '../services/language/language.model';

/**
 * Переносит ответы `/api` из SSR в браузер.
 *
 * Штатный transfer cache Angular тут не работает: он зарегистрирован как
 * root-interceptor и выполняется последним, уже после `ssrBaseUrlInterceptor`,
 * поэтому на сервере ключ считается от `http://cv-backend:3333/api/...`,
 * а в браузере — от `/api/...`. Ключи не совпадают, кеш всегда промахивается,
 * браузер повторяет все запросы и рушит гидрацию `@if`-блоков.
 *
 * Interceptor должен стоять ПЕРВЫМ в цепочке, чтобы видеть относительный URL.
 */
export const apiTransferStateInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.startsWith('/api')) {
    return next(req);
  }

  const transferState = inject(TransferState);
  const lang = inject(LanguageService).currentLang();
  // Язык в ключ не входит: сигналы секций при гидрации создаются пустыми, и
  // если данных нет синхронно, первый change detection отрисует скелетоны,
  // а серверный DOM будет выброшен. Поэтому браузер обязан найти данные SSR
  // даже когда выбрал другой язык — расхождение решается перезапросом ниже.
  const key = makeStateKey<unknown>(`api:${req.urlWithParams}`);

  if (isPlatformServer(inject(PLATFORM_ID))) {
    transferState.set(SSR_LANG_STATE_KEY, lang);
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          transferState.set(key, event.body);
        }
      }),
    );
  }

  if (!transferState.hasKey(key)) {
    return next(req);
  }

  const body = transferState.get<unknown>(key, null);
  // Одноразовое использование: перезагрузка секции должна идти в сеть.
  transferState.remove(key);
  const fromSsr = of(
    new HttpResponse({ body, status: 200, statusText: 'OK', url: req.url }),
  ) as Observable<HttpEvent<unknown>>;

  if (transferState.get(SSR_LANG_STATE_KEY, lang) === lang) {
    return fromSsr;
  }

  // Язык SSR не совпал с выбором пользователя (в dev это всегда так: `ng serve`
  // рендерит через Vite, минуя `server.ts` с токеном SSR_LANG). Сначала отдаём
  // серверное тело — гидрация проходит на той же разметке и контент не мигает,
  // а следом догружаем перевод с корректным `Accept-Language`.
  return concat(fromSsr, next(req));
};
