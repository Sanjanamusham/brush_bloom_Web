import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ToastService } from './toast.service';

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

const STORAGE_KEY = 'brush-bloom-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private toast = inject(ToastService);
  private linesSignal = signal<CartLine[]>(this.loadFromStorage());

  readonly lines = this.linesSignal.asReadonly();
  readonly count = computed(() => this.linesSignal().reduce((sum, l) => sum + l.quantity, 0));
  readonly subtotal = computed(() =>
    this.linesSignal().reduce((sum, l) => sum + l.price * l.quantity, 0),
  );

  add(product: Product, quantity = 1): void {
    const lines = [...this.linesSignal()];
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 50);
    } else {
      lines.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? null,
        quantity: Math.min(quantity, 50),
      });
    }
    this.toast.success(`Added "${product.name}" to cart`);
    this.set(lines);
    
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) return this.remove(productId);
    const lines = this.linesSignal().map((l) =>
      l.productId === productId ? { ...l, quantity: Math.min(quantity, 50) } : l,
    );
    this.set(lines);
  }

  remove(productId: string): void {
    this.set(this.linesSignal().filter((l) => l.productId !== productId));
    
  }

  clear(): void {
    this.set([]);
  }

  private set(lines: CartLine[]): void {
    this.linesSignal.set(lines);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // localStorage unavailable (e.g. private browsing) — cart still works for this session.
    }
  }

  private loadFromStorage(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  }
}
