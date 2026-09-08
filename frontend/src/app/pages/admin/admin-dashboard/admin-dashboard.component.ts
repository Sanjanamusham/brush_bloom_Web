import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsPanelComponent } from './products-panel/products-panel.component';
import { OrdersPanelComponent } from './orders-panel/orders-panel.component';
import { AnalyticsPanelComponent } from './analytics-panel/analytics-panel.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ProductsPanelComponent, OrdersPanelComponent, AnalyticsPanelComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

 
  tab = signal<'products' | 'orders' | 'analytics'>('analytics');

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/admin']));
  }
}
