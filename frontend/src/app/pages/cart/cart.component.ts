import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import {
  formatPrice,
  INDIAN_STATES,
  resolveImageUrl,
  siteConfig,
  whatsappLink,
} from '../../shared/config/site.config';

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
 siteName = siteConfig.name;

  formatPrice = formatPrice;
  resolveImageUrl = resolveImageUrl;
  states = INDIAN_STATES;
  showForm = signal(false);
  submitting = signal(false);
  submitError = signal<string | null>(null);
  result = signal<{ orderCode: string; whatsapp: string } | null>(null);
  referenceImages = signal<string[]>([]);
  uploadingReference = signal(false);
  referenceError = signal<string | null>(null);

  // Field-by-field validation mirrors the backend's Zod schema exactly (see
  // backend/src/validators/schemas.js orderRequestSchema) so a person never
  // hits a server-side rejection the form itself couldn't have already caught.
  form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9][0-9\s-]{7,17}$/)]],
    addressLine1: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    landmark: ['', [Validators.maxLength(150)]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    state: ['', [Validators.required]],
    pincode: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
    note: ['', [Validators.maxLength(1000)]],
    referenceLink: ['', [Validators.pattern(/^https?:\/\/.+/)]],
    
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

  // Only digits allowed while typing the PIN code — blocks letters/symbols at input time
  // rather than only showing a validation error after the fact.
  onPincodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 6);
    if (digitsOnly !== input.value) {
      this.form.controls.pincode.setValue(digitsOnly);
    }
  }

  submitOrder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.submitError.set(null);

    const { customerName, phone, addressLine1, landmark, city, state, pincode, note , referenceLink } =
      this.form.getRawValue();
    const items = this.cart.lines().map((l) => ({ productId: l.productId, quantity: l.quantity }));

    this.orderService
      .create({ customerName, phone, addressLine1, landmark, city, state, pincode, note, referenceLink,items })
      .subscribe({
        next: (res) => {
          const lines = res.items.map((i) => `- ${i.name} x${i.quantity}`).join('\n');
          const addressParts = [addressLine1];
          if (landmark) addressParts.push(landmark);
          addressParts.push(city, state, pincode);
          const fullAddress = addressParts.join(', ');
          const referenceLine = referenceLink ? `\nReference: ${referenceLink}` : '';


          const message =
            `New order request ${res.orderCode}\n` +
            `Name: ${customerName}\n` +
            `Address: ${fullAddress}\n\n` +
            `Items:\n${lines}\n\n` +
            `Estimated total: ${formatPrice(res.estimatedTotal)}`+
             referenceLine;

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



  onReferenceFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = '';
  if (files.length === 0) return;

  const remainingSlots = 3 - this.referenceImages().length;
  if (remainingSlots <= 0) {
    this.referenceError.set('You can attach up to 3 reference images.');
    return;
  }
  const toUpload = files.slice(0, remainingSlots);

  const oversized = toUpload.find((f) => f.size > 5 * 1024 * 1024);
  if (oversized) {
    this.referenceError.set('Each image must be under 5MB.');
    return;
  }

  this.referenceError.set(null);
  this.uploadingReference.set(true);
  this.orderService.uploadReferenceImages(toUpload).subscribe({
    next: (res) => {
      this.referenceImages.update((urls) => [...urls, ...res.urls]);
      this.uploadingReference.set(false);
    },
    error: () => {
      this.referenceError.set('Could not upload image. Please try again.');
      this.uploadingReference.set(false);
    },
  });
}

removeReferenceImage(index: number): void {
  this.referenceImages.update((urls) => urls.filter((_, i) => i !== index));
}
}