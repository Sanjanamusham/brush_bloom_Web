import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api-response.model';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth/admin`;

  // Access token lives only in memory (never localStorage) to reduce XSS token-theft risk.
  // Session survives a page refresh via the httpOnly refresh-token cookie + /refresh below.
  private accessToken = signal<string | null>(null);
  readonly admin = signal<AdminUser | null>(null);

  getToken(): string | null {
    return this.accessToken();
  }

  login(email: string, password: string): Observable<AdminUser> {
    return this.http
      .post<ApiResponse<{ accessToken: string; admin: AdminUser }>>(
        `${this.base}/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          this.accessToken.set(res.data.accessToken);
          this.admin.set(res.data.admin);
        }),
        map((res) => res.data.admin),
      );
  }

  refresh(): Observable<boolean> {
    return this.http
      .post<ApiResponse<{ accessToken: string }>>(
        `${this.base}/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((res) => this.accessToken.set(res.data.accessToken)),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  fetchMe(): Observable<AdminUser | null> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.base}/me`).pipe(
      tap((res) => this.admin.set(res.data)),
      map((res) => res.data),
      catchError(() => of(null)),
    );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.base}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearSession()));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<ApiResponse<{ message: string }>>(`${this.base}/forgot-password`, { email })
      .pipe(map((res) => res.data));
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http
      .post<ApiResponse<{ message: string }>>(`${this.base}/reset-password`, {
        token,
        newPassword,
      })
      .pipe(map((res) => res.data));
  }

  clearSession(): void {
    this.accessToken.set(null);
    this.admin.set(null);
  }
}
