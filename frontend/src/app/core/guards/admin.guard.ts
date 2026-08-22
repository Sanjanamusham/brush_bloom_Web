import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Protects /admin/dashboard. Tries a token refresh first (covers a page reload,
 * since the access token only lives in memory) before redirecting to /admin.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) return true;

  return auth.refresh().pipe(
    map((ok) => {
      if (ok) return true;
      return router.createUrlTree(['/admin']);
    }),
  );
};
