import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { TrackedOrder } from '../../core/models/order.model';
import { formatPrice } from '../../shared/config/site.config';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './track-order.component.html',
  styleUrl: './track-order.component.scss',
})
export class TrackOrderComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
 cancelling = signal(false);

  formatPrice = formatPrice;
  loading = signal(false);
  searched = signal(false);
  order = signal<TrackedOrder | null>(null);

  form = this.fb.nonNullable.group({
    orderCode: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9][0-9\s-]{7,17}$/)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { orderCode, phone } = this.form.getRawValue();

    this.orderService.track(orderCode, phone).subscribe({
      next: (res) => {
        this.order.set(res.found && res.order ? res.order : null);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.order.set(null);
        this.searched.set(true);
        this.loading.set(false);
      },
    });
  }

  cancelOrder(): void {
  const o = this.order();
  if (!o) return;
  this.cancelling.set(true);
  const { orderCode, phone } = this.form.getRawValue();
  this.orderService.cancel(orderCode, phone).subscribe({
    next: () => {
      this.order.set({ ...o, status: 'Cancelled' });
      this.toast.success('Order cancelled.');
      this.cancelling.set(false);
    },
    error: (err) => {
      this.toast.error(err?.error?.message || 'Could not cancel this order.');
      this.cancelling.set(false);
    },
  });
}
}
