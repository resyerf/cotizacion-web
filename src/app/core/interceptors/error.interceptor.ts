import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ApiError } from '../models/api-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(MessageService);

  return next(req).pipe(
    catchError(err => {
      const error: ApiError = err.error ?? { message: 'Error de conexión', errors: [] };
      const detail = error.errors?.length
        ? error.errors.join(' ')
        : error.message ?? 'Ha ocurrido un error.';

      if (err.status !== 404) {
        toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
      }

      return throwError(() => error);
    })
  );
};
