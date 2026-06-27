import { HttpContextToken } from '@angular/common/http';

export const SKIP_HTTP_ERROR_NOTIFY = new HttpContextToken<boolean>(() => false);
