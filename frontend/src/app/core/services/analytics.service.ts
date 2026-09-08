import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

declare const gtag: (...args: unknown[]) => void;

function getOrCreateSessionId(): string {
  const key = 'bb_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/analytics`;
  private sessionId = getOrCreateSessionId();
  private currentPath = '';
  private pageEnteredAt = 0;

  init(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.reportDurationForPreviousPage();
      this.currentPath = (e as NavigationEnd).urlAfterRedirects;
      this.pageEnteredAt = Date.now();
      this.recordPageView(this.currentPath);

      if (typeof gtag === 'function') {
        gtag('event', 'page_view', { page_path: this.currentPath });
      }
    });

    window.addEventListener('beforeunload', () => this.reportDurationForPreviousPage());
  }

  private recordPageView(path: string): void {
    this.http.post(`${this.base}/pageview`, { path, sessionId: this.sessionId }).subscribe({ error: () => {} });
  }

  private reportDurationForPreviousPage(): void {
    if (!this.currentPath || !this.pageEnteredAt) return;
    const durationMs = Date.now() - this.pageEnteredAt;
    const payload = JSON.stringify({ sessionId: this.sessionId, path: this.currentPath, durationMs });
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(`${this.base}/duration`, blob);
  }
}