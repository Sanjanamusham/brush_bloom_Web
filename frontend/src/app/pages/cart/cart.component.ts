import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { formatPrice, resolveImageUrl, siteConfig, whatsappLink } from '../../shared/config/site.config';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  cart = inject(CartService);
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  formatPrice = formatPrice;
  resolveImageUrl = resolveImageUrl;
  showForm = signal(false);
  submitting = signal(false);
  submitError = signal<string | null>(null);
  result = signal<{ orderCode: string; whatsapp: string } | null>(null);

  form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9][0-9\s-]{7,17}$/)]],
    address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    note: ['', [Validators.maxLength(1000)]],
  });

  updateQty(productId: string, qty: number): void {
    this.cart.updateQuantity(productId, qty);
  }

  remove(productId: string): void {
    this.cart.remove(productId);
  }

  openForm(): void {
    this.showForm.set(true);
  }

  submitOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);

    const { customerName, phone, address, note } = this.form.getRawValue();
    const items = this.cart.lines().map((l) => ({ productId: l.productId, quantity: l.quantity }));

    this.orderService.create({ customerName, phone, address, note, items }).subscribe({
      next: (res) => {
        const lines = res.items.map((i) => `- ${i.name} x${i.quantity}`).join('\n');
        const message =
          `New order request ${res.orderCode}\n` +
          `Name: ${customerName}\n` +
          `Address: ${address}\n\n` +
          `Items:\n${lines}\n\n` +
          `Estimated total: ${formatPrice(res.estimatedTotal)}`;

        this.result.set({ orderCode: res.orderCode, whatsapp: whatsappLink(message) });
        this.cart.clear();
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitError.set(
          err?.error?.message || 'Could not submit your order. Please try again.',
        );
        this.submitting.set(false);
      },
    });
  }

  siteName = siteConfig.name;
}
