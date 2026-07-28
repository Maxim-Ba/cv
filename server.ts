import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import compression from 'compression';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { basename, dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { SSR_LANG, resolveLangFromHeaders } from './src/app/services/language/language.model';

/** Имена собранных бандлов вида `main-Q44ZNHMX.js` — содержат хеш контента. */
const HASHED_FILE_NAME = /-[A-Z0-9]{8}\.[a-z0-9]+$/;

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  // В k8s Traefik ходит в этот сервер напрямую, без nginx, поэтому сжимать
  // SSR-HTML и статику должен сам Express — иначе initial bundle едет как ~1 МБ.
  server.use(compression());

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      setHeaders: (res, filePath) => {
        // Файлы с хешем в имени неизменяемы. Ассеты без хеша (assets/i18n,
        // картинки, favicon) обязаны перепроверяться, иначе правка перевода
        // не доедет до вернувшегося посетителя ещё год.
        res.setHeader(
          'Cache-Control',
          HASHED_FILE_NAME.test(basename(filePath))
            ? 'public, max-age=31536000, immutable'
            : 'public, max-age=3600, must-revalidate',
        );
      },
    }),
  );

  // API проксирует реверс-прокси (nginx/Traefik). Если запрос всё же дошёл сюда,
  // рендерить приложение нельзя: это лишний полный SSR-проход со всеми запросами
  // к бэкенду в ответ на промах роутинга.
  server.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Лёгкий endpoint для k8s probes — без SSR.
  server.get('/healthz', (_req, res) => {
    res.status(200).send('ok');
  });

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    // Разметка зависит от выбранной локали — промежуточные кеши обязаны это учитывать.
    res.vary('Cookie');
    res.vary('Accept-Language');

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          {
            provide: SSR_LANG,
            useValue: resolveLangFromHeaders(headers.cookie, headers['accept-language']),
          },
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
