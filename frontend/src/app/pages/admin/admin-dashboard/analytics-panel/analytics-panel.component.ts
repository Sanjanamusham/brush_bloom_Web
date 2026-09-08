import { Component, OnDestroy, inject, signal } from '@angular/core';
import { AdminService, AnalyticsSummary } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-analytics-panel',
  standalone: true,
  templateUrl: './analytics-panel.component.html',
  styleUrl: './analytics-panel.component.scss',
})
export class AnalyticsPanelComponent implements OnDestroy {
  private admin = inject(AdminService);
  summary = signal<AnalyticsSummary | null>(null);
  loading = signal(true);
  private intervalId = setInterval(() => this.load(), 30000);

  constructor() {
    this.load();
  }

  load(): void {
    this.admin.getAnalyticsSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}