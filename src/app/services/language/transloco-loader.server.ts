import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Observable, from } from 'rxjs';
import { SSR_BROWSER_DIST_FOLDER } from './language.model';

@Injectable({ providedIn: 'root' })
export class TranslocoFsLoaderService implements TranslocoLoader {
  private browserDist = inject(SSR_BROWSER_DIST_FOLDER);

  getTranslation(lang: string): Observable<Translation> {
    return from(
      readFile(join(this.browserDist, 'assets', 'i18n', `${lang}.json`), 'utf-8').then(
        (data) => JSON.parse(data) as Translation,
      ),
    );
  }
}
