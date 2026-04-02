import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user?.token) {
    // Check token expiry before sending
    if (isTokenExpired(user.token)) {
      authService.logout();
      return throwError(() => new Error('Session expired'));
    }

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${user.token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Token rejected by server — force logout
        authService.logout();
        router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
      }
      return throwError(() => err);
    })
  );
};

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // malformed token = treat as expired
  }
}
