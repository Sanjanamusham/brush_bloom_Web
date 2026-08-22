import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { AdminOrder } from '../../../../core/models/order.model';
import { ORDER_STATUSES, formatPrice } from '../../../../shared/config/site.config';

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-panel.component.html',
  styleUrl: './orders-panel.component.scss',
})
export class OrdersPanelComponent {
  private admin = inject(AdminService);

  orders = signal<AdminOrder[]>([]);
  loading = signal(true);
  statuses = ORDER_STATUSES;
  formatPrice = formatPrice;

  search = signal('');
  statusFilter = signal('');
  savingId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin
      .listOrders({ status: this.statusFilter() || undefined, search: this.search() || undefined })
      .subscribe({
        next: (data) => {
          this.orders.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onStatusChange(order: AdminOrder, newStatus: string): void {
    this.savingId.set(order.id);
    this.admin.updateOrderStatus(order.id, newStatus, order.deliveryNote).subscribe({
      next: (updated) => {
        this.orders.set(this.orders().map((o) => (o.id === updated.id ? updated : o)));
        this.savingId.set(null);
      },
      error: () => this.savingId.set(null),
    });
  }

  onNoteBlur(order: AdminOrder, note: string): void {
    if (note === (order.deliveryNote || '')) return;
    this.admin.updateOrderStatus(order.id, order.status, note).subscribe({
      next: (updated) => {
        this.orders.set(this.orders().map((o) => (o.id === updated.id ? updated : o)));
      },
    });
  }
}
