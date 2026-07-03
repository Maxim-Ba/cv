import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from './language.service';

export function bindLanguageReload(reload: () => void): void {
  const languageService = inject(LanguageService);
  const destroyRef = inject(DestroyRef);

  reload();
  languageService.langChanges$
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(() => reload());
}
